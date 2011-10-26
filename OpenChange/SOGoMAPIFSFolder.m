/* SOGoMAPIFSFolder.m - this file is part of SOGo
 *
 * Copyright (C) 2010 Inverse inc.
 *
 * Author: Wolfgang Sourdeau <wsourdeau@inverse.ca>
 *
 * This file is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3, or (at your option)
 * any later version.
 *
 * This file is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; see the file COPYING.  If not, write to
 * the Free Software Foundation, Inc., 59 Temple Place - Suite 330,
 * Boston, MA 02111-1307, USA.
 */

#import <Foundation/NSArray.h>
#import <Foundation/NSException.h>
#import <Foundation/NSFileManager.h>
#import <Foundation/NSString.h>
#import <Foundation/NSValue.h>
#import <Foundation/NSURL.h>

#import <NGExtensions/NSObject+Logs.h>

#import "EOQualifier+MAPI.h"
#import "SOGoMAPIFSMessage.h"

#import "SOGoMAPIFSFolder.h"

#undef DEBUG
#include <mapistore/mapistore.h>
#include <mapistore/mapistore_errors.h>
#include <libmapiproxy.h>
#include <param.h>

static NSString *privateDir = nil;

@implementation SOGoMAPIFSFolder

+ (void) initialize
{
  struct loadparm_context *lpCtx;
  const char *cPrivateDir;

  if (!privateDir)
    {
      lpCtx = loadparm_init_global (true);
      cPrivateDir = lpcfg_private_dir (lpCtx);
      privateDir = [NSString stringWithUTF8String: cPrivateDir];
      [privateDir retain];
    }
}

+ (id) folderWithURL: (NSURL *) url
	andTableType: (uint8_t) tableType
{
  SOGoMAPIFSFolder *newFolder;

  newFolder = [[self alloc] initWithURL: url
			    andTableType: tableType];
  [newFolder autorelease];

  return newFolder;
}

- (id) init
{
  if ((self = [super init]))
    {
      directory = nil;
      directoryIsSane = NO;
    }

  return self;
}

- (void) dealloc
{
  [directory release];
  [super dealloc];
}

- (id) initWithURL: (NSURL *) url
      andTableType: (uint8_t) tableType
{
  NSString *path, *tableParticle;

  if ((self = [self init]))
    {
      if (tableType == MAPISTORE_MESSAGE_TABLE)
	tableParticle = @"message";
      else if (tableType == MAPISTORE_FAI_TABLE)
	tableParticle = @"fai";
      else if (tableType == MAPISTORE_FOLDER_TABLE)
	tableParticle = @"folder";
      else
	{
	  [NSException raise: @"MAPIStoreIOException"
		       format: @"unsupported table type: %d", tableType];
	  tableParticle = nil;
	}

      path = [url path];
      if (![path hasSuffix: @"/"])
	path = [NSString stringWithFormat: @"%@/", path];
      directory = [NSString stringWithFormat: @"%@/mapistore/SOGo/%@/%@/%@%@",
			    privateDir, [url user], tableParticle,
			    [url host], path];
      [self logWithFormat: @"directory: %@", directory];
      [directory retain];
      ASSIGN (nameInContainer, [path stringByDeletingLastPathComponent]);
    }

  return self;
}

- (id) initWithName: (NSString *) newName
	inContainer: (id) newContainer
{
  if ((self = [super initWithName: newName inContainer: newContainer]))
    {
      directory = [[newContainer directory]
                    stringByAppendingPathComponent: newName];
      [directory retain];
    }

  return self;
}

- (NSString *) directory
{
  return directory;
}

- (SOGoMAPIFSMessage *) newMessage
{
  NSString *filename;

  filename = [NSString stringWithFormat: @"%@.plist",
		       [SOGoObject globallyUniqueObjectId]];

  return [SOGoMAPIFSMessage objectWithName: filename inContainer: self];
}

- (void) ensureDirectory
{
  NSFileManager *fm;
  NSDictionary *attributes;
  BOOL isDir;

  if (!directory)
    [NSException raise: @"MAPIStoreIOException"
                 format: @"directory is nil"];

  fm = [NSFileManager defaultManager];
  if ([fm fileExistsAtPath: directory isDirectory: &isDir])
    {
      if (!isDir)
	[NSException raise: @"MAPIStoreIOException"
		    format: @"object at path '%@' is not a directory",
		     directory];
    }
  else
    {
      attributes
	= [NSDictionary dictionaryWithObject: [NSNumber numberWithInt: 0700]
				      forKey: NSFilePosixPermissions];
      [fm createDirectoryAtPath: directory
		     attributes: attributes];
    }

  directoryIsSane = YES;
}

- (NSArray *) _objectsInDirectory: (BOOL) dirs
{
  NSFileManager *fm;
  NSArray *contents;
  NSMutableArray *files;
  NSUInteger count, max;
  NSString *file, *fullName;
  BOOL isDir;

  if (!directoryIsSane)
    [self ensureDirectory];

  fm = [NSFileManager defaultManager];
  contents = [fm directoryContentsAtPath: directory];
  max = [contents count];
  files = [NSMutableArray arrayWithCapacity: max];
  for (count = 0; count < max; count++)
    {
      file = [contents objectAtIndex: count];
      fullName = [directory stringByAppendingPathComponent: file];
      if ([fm fileExistsAtPath: fullName
		   isDirectory: &isDir]
	  && dirs == isDir)
	[files addObject: file];
    }

  return files;
}

- (NSArray *) toManyRelationshipKeys
{
  return [self _objectsInDirectory: YES];
}

- (NSArray *) toOneRelationshipKeys
{
  return [self _objectsInDirectory: NO];
}

- (NSArray *) toOneRelationshipKeysMatchingQualifier: (EOQualifier *) qualifier
                                    andSortOrderings: (NSArray *) sortOrderings
{
  NSArray *allKeys;
  NSMutableArray *keys;
  NSUInteger count, max;
  NSString *messageKey;
  SOGoMAPIFSMessage *message;

  if (sortOrderings)
    [self warnWithFormat: @"sorting is not handled yet"];

  allKeys = [self toOneRelationshipKeys];
  if (qualifier)
    {
      [self logWithFormat: @"%s: getting restricted FAI keys", __PRETTY_FUNCTION__];
      max = [allKeys count];
      keys = [NSMutableArray arrayWithCapacity: max];
      for (count = 0; count < max; count++)
        {
          messageKey = [allKeys objectAtIndex: count];
          message = [self lookupName: messageKey
                           inContext: nil
                             acquire: NO];
          if ([qualifier evaluateMAPIVolatileMessage: message])
            [keys addObject: messageKey];
	}
    }
  else
    keys = (NSMutableArray *) allKeys;

  return keys;
}

- (id) lookupName: (NSString *) fileName
	inContext: (WOContext *) woContext
	  acquire: (BOOL) acquire
{
  NSFileManager *fm;
  NSString *fullName;
  id object;
  BOOL isDir;

  if (!directoryIsSane)
    [self ensureDirectory];

  fm = [NSFileManager defaultManager];
  fullName = [directory stringByAppendingPathComponent: fileName];
  if ([fm fileExistsAtPath: fullName
	       isDirectory: &isDir])
    {
      if (isDir)
	object = [isa objectWithName: fileName
                         inContainer: self];
      else
	object = [SOGoMAPIFSMessage objectWithName: fileName
				       inContainer: self];
    }
  else
    object = nil;

  return object;
}

- (id) _fileAttributeForKey: (NSString *) key
{
  NSDictionary *attributes;

  attributes = [[NSFileManager defaultManager]
                   fileAttributesAtPath: directory
                           traverseLink: NO];
  
  return [attributes objectForKey: key];
}

- (NSCalendarDate *) creationTime
{
  return [self _fileAttributeForKey: NSFileCreationDate];
}

- (NSCalendarDate *) lastModificationTime
{
  return [self _fileAttributeForKey: NSFileModificationDate];
}

@end
