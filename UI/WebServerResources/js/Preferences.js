!function(){"use strict";function e(e,t){e.state("preferences",{abstract:!0,views:{preferences:{templateUrl:"preferences.html",controller:"PreferencesController",controllerAs:"app"}}}).state("preferences.general",{url:"/general",views:{module:{templateUrl:"generalPreferences.html"}}}).state("preferences.calendars",{url:"/calendars",views:{module:{templateUrl:"calendarsPreferences.html"}}}).state("preferences.addressbooks",{url:"/addressbooks",views:{module:{templateUrl:"addressbooksPreferences.html"}}}).state("preferences.mailer",{url:"/mailer",views:{module:{templateUrl:"mailerPreferences.html"}}}),t.otherwise("/general")}function t(e){e.$on("$routeChangeError",function(e,t,a,r){console.error(e,t,a,r)})}angular.module("SOGo.PreferencesUI",["ui.router","ck","SOGo.Common","SOGo.MailerUI","SOGo.ContactsUI","SOGo.Authentication","as.sortable"]).config(e).run(t),e.$inject=["$stateProvider","$urlRouterProvider"],t.$inject=["$rootScope"]}(),function(){"use strict";function e(e,t,a,r,n){function s(){return!(r>0)&&!n}function i(){e.cancel()}function o(){e.hide()}var l=this;l.defaultPort=143,l.defaults=t,l.account=a,l.accountId=r,l.customFromIsReadonly=s,l.cancel=i,l.save=o,l.hostnameRE=r>0?/^(?!(127\.0\.0\.1|localhost(?:\.localdomain)?)$)/:/./,l.account.encryption?"ssl"==l.account.encryption&&(l.defaultPort=993):l.account.encryption="none"}e.$inject=["$mdDialog","defaults","account","accountId","mailCustomFromEnabled"],angular.module("SOGo.PreferencesUI").controller("AccountDialogController",e)}(),function(){"use strict";function e(e,t,a,r,n,s){function i(){a.cancel()}function o(){var e=[m.filter.actions];return"allmessages"!=m.filter.match&&e.push(m.filter.rules),_.every(e,function(e){return e&&e.length>0})}function c(e){a.hide()}function d(e){m.filter.rules||(m.filter.rules=[]),m.filter.rules.push({field:"subject",operator:"contains"})}function f(e){m.filter.rules.splice(e,1)}function u(e){m.filter.actions||(m.filter.actions=[]),m.filter.actions.push({method:"discard"})}function h(e){m.filter.actions.splice(e,1)}var m=this,g=t.sieveCapabilities,p=t.forwardEnabled;t.vacationEnabled;m.filter=r,m.mailboxes=n,m.labels=s,m.cancel=i,m.hasRulesAndActions=o,m.save=c,m.addMailFilterRule=d,m.removeMailFilterRule=f,m.addMailFilterAction=u,m.removeMailFilterAction=h,m.fieldLabels={subject:l("Subject"),from:l("From"),to:l("To"),cc:l("Cc"),to_or_cc:l("To or Cc"),size:l("Size (Kb)"),header:l("Header")},g.indexOf("body")>-1&&(m.fieldLabels.body=l("Body")),m.methodLabels={discard:l("Discard the message"),keep:l("Keep the message"),stop:l("Stop processing filter rules")},p&&(m.methodLabels.redirect=l("Forward the message to")),g.indexOf("reject")>-1&&(m.methodLabels.reject=l("Send a reject message")),g.indexOf("fileinto")>-1&&(m.methodLabels.fileinto=l("File the message in")),(g.indexOf("imapflags")>-1||g.indexOf("imap4flags")>-1)&&(m.methodLabels.addflag=l("Flag the message with")),m.numberOperatorLabels={under:l("is under"),over:l("is over")},m.textOperatorLabels={is:l("is"),is_not:l("is not"),contains:l("contains"),contains_not:l("does not contain"),matches:l("matches"),matches_not:l("does not match")},g.indexOf("regex")>-1&&(m.textOperatorLabels.regex=l("matches regex"),m.textOperatorLabels.regex_not=l("does not match regex")),m.flagLabels={seen:l("Seen"),deleted:l("Deleted"),answered:l("Answered"),flagged:l("Flagged"),junk:l("Junk"),not_junk:l("Not Junk")}}e.$inject=["$scope","$window","$mdDialog","filter","mailboxes","labels"],angular.module("SOGo.PreferencesUI").controller("FiltersDialogController",e)}(),function(){"use strict";function e(e,t,a,r,n,s,i,o,c,d,f,u,h,m){var g,p=this,w=[],v=(new Date).beginOfDay().addDays(1);this.$onInit=function(){this.preferences=h,this.passwords={newPassword:null,newPasswordConfirmation:null},this.timeZonesSearchText="",this.sieveVariablesCapability=t.sieveCapabilities.indexOf("variables")>=0,o.activeUser("path").mail&&(g=new u({id:0})).$getMailboxes().then(function(){for(var e=g.$flattenMailboxes({all:!0}),t=-1,a=e.length;++t<a;)w.push(e[t])}),h.defaults.SOGoAlternateAvatar&&(f.$alternateAvatar=h.defaults.SOGoAlternateAvatar),this.updateVacationDates()},this.go=function(e,t){t.$valid&&(r("xs")&&n("left").close(),a.go("preferences."+e))},this.onLanguageChange=function(e){e.$valid&&d.confirm(l("Warning"),l("Save preferences and reload page now?"),{ok:l("Yes"),cancel:l("No")}).then(function(){p.save(e,{quick:!0}).then(function(){t.location.reload(!0)})})},this.addCalendarCategory=function(e){this.preferences.defaults.SOGoCalendarCategoriesColors["New category"]="#aaa",this.preferences.defaults.SOGoCalendarCategories.push("New category"),c("calendarCategory_"+(this.preferences.defaults.SOGoCalendarCategories.length-1)),e.$setDirty()},this.removeCalendarCategory=function(e,t){var a=this.preferences.defaults.SOGoCalendarCategories[e];this.preferences.defaults.SOGoCalendarCategories.splice(e,1),delete this.preferences.defaults.SOGoCalendarCategoriesColors[a],t.$setDirty()},this.addContactCategory=function(e){this.preferences.defaults.SOGoContactsCategories.push(""),c("contactCategory_"+(this.preferences.defaults.SOGoContactsCategories.length-1)),e.$setDirty()},this.removeContactCategory=function(e,t){this.preferences.defaults.SOGoContactsCategories.splice(e,1),t.$setDirty()},this.addMailAccount=function(e,a){var r;this.preferences.defaults.AuxiliaryMailAccounts.push({}),r=_.last(this.preferences.defaults.AuxiliaryMailAccounts),angular.extend(r,{name:"",identities:[{fullName:"",email:""}],receipts:{receiptAction:"ignore",receiptNonRecipientAction:"ignore",receiptOutsideDomainAction:"ignore",receiptAnyAction:"ignore"}}),s.show({controller:"AccountDialogController",controllerAs:"$AccountDialogController",templateUrl:"editAccount?account=new",targetEvent:e,locals:{defaults:this.preferences.defaults,account:r,accountId:this.preferences.defaults.AuxiliaryMailAccounts.length-1,mailCustomFromEnabled:t.mailCustomFromEnabled}}).then(function(){a.$setDirty()}).catch(function(){p.preferences.defaults.AuxiliaryMailAccounts.pop()})},this.editMailAccount=function(e,a,r){var n=this.preferences.defaults.AuxiliaryMailAccounts[a];s.show({controller:"AccountDialogController",controllerAs:"$AccountDialogController",templateUrl:"editAccount?account="+a,targetEvent:e,locals:{defaults:this.preferences.defaults,account:n,accountId:a,mailCustomFromEnabled:t.mailCustomFromEnabled}}).then(function(){p.preferences.defaults.AuxiliaryMailAccounts[a]=n,r.$setDirty()})},this.removeMailAccount=function(e,t){this.preferences.defaults.AuxiliaryMailAccounts.splice(e,1),t.$setDirty()},this.addMailLabel=function(e){var t="_$$"+guid();this.preferences.defaults.SOGoMailLabelsColors[t]=["New label","#aaa"],c("mailLabel_"+(_.size(this.preferences.defaults.SOGoMailLabelsColors)-1)),e.$setDirty()},this.removeMailLabel=function(e,t){delete this.preferences.defaults.SOGoMailLabelsColors[e],t.$setDirty()},this.addMailFilter=function(e,t){var a={match:"all"};s.show({templateUrl:"editFilter?filter=new",controller:"FiltersDialogController",controllerAs:"filterEditor",targetEvent:e,locals:{filter:a,mailboxes:w,labels:this.preferences.defaults.SOGoMailLabelsColors}}).then(function(){p.preferences.defaults.SOGoSieveFilters||(p.preferences.defaults.SOGoSieveFilters=[]),p.preferences.defaults.SOGoSieveFilters.push(a),t.$setDirty()})},this.editMailFilter=function(e,t,a){var r=angular.copy(this.preferences.defaults.SOGoSieveFilters[t]);s.show({templateUrl:"editFilter?filter="+t,controller:"FiltersDialogController",controllerAs:"filterEditor",targetEvent:null,locals:{filter:r,mailboxes:w,labels:this.preferences.defaults.SOGoMailLabelsColors}}).then(function(){p.preferences.defaults.SOGoSieveFilters[t]=r,a.$setDirty()})},this.removeMailFilter=function(e,t){this.preferences.defaults.SOGoSieveFilters.splice(e,1),t.$setDirty()},this.addDefaultEmailAddresses=function(e){var a=[];angular.isDefined(this.preferences.defaults.Vacation.autoReplyEmailAddresses)&&(a=this.preferences.defaults.Vacation.autoReplyEmailAddresses.split(",")),this.preferences.defaults.Vacation.autoReplyEmailAddresses=_.union(t.defaultEmailAddresses.split(","),a).join(","),e.$setDirty()},this.userFilter=function(e,t){return e.length<o.minimumSearchLength()?[]:f.$filter(e,t).then(function(e){return _.forEach(e,function(e){e.$$image||(e.image?e.$$image=e.image:p.preferences.avatar(e.c_email,32,{no_404:!0}).then(function(t){e.$$image=t}))}),e})},this.confirmChanges=function(e,a){var r;if(a.$dirty&&$form.$valid){for(e.preventDefault(),e.stopPropagation(),r=e.target;"A"!=r.tagName;)r=r.parentNode;d.confirm(l("Unsaved Changes"),l("Do you want to save your changes made to the configuration?"),{ok:l("Save"),cancel:l("Don't Save")}).then(function(){p.save(a,{quick:!0}).then(function(){t.location=r.href})},function(){t.location=r.href})}},this.save=function(a,r){var n,s,o,c,f,u;if(s=!0,f=[],t.forwardConstraints>0&&angular.isDefined(this.preferences.defaults.Forward)&&this.preferences.defaults.Forward.enabled&&angular.isDefined(this.preferences.defaults.Forward.forwardAddress))for(o=this.preferences.defaults.Forward.forwardAddress.split(","),c=t.defaultEmailAddresses.split(/, */),_.forEach(c,function(e){var t=e.split("@")[1];t&&f.push(t.toLowerCase())}),n=0;n<o.length&&s;n++)u=o[n].split("@")[1].toLowerCase(),f.indexOf(u)<0&&1==t.forwardConstraints?(d.alert(l("Error"),l("You are not allowed to forward your messages to an external email address.")),s=!1):f.indexOf(u)>=0&&2==t.forwardConstraints&&(d.alert(l("Error"),l("You are not allowed to forward your messages to an internal email address.")),s=!1);return s?this.preferences.$save().then(function(e){r&&r.quick||(i.show(i.simple().content(l("Preferences saved")).position("bottom right").hideDelay(2e3)),a.$setPristine())}):e.reject()},this.canChangePassword=function(){return!!(this.passwords.newPassword&&this.passwords.newPassword.length>0&&this.passwords.newPasswordConfirmation&&this.passwords.newPasswordConfirmation.length&&this.passwords.newPassword==this.passwords.newPasswordConfirmation)},this.changePassword=function(){m.changePassword(this.passwords.newPassword).then(function(){var e=s.alert({title:l("Password"),content:l("The password was changed successfully."),ok:l("OK")});s.show(e).finally(function(){e=void 0})},function(e){var t=s.alert({title:l("Password"),content:e,ok:l("OK")});s.show(t).finally(function(){t=void 0})})},this.timeZonesListFilter=function(e){return _.filter(this.timeZonesList,function(t){return t.toUpperCase().indexOf(e.toUpperCase())>=0})},this.updateVacationDates=function(){var e=this.preferences.defaults;e&&e.Vacation&&e.Vacation.enabled&&(this.toggleVacationStartDate(),this.toggleVacationEndDate())},this.toggleVacationStartDate=function(){var e;(e=this.preferences.defaults.Vacation).startDateEnabled&&(e.endDateEnabled&&e.startDate.getTime()>e.endDate.getTime()&&(e.startDate=new Date(e.endDate.getTime()),e.startDate.addDays(-1)),e.startDate.getTime()<v.getTime()&&(e.startDate=new Date(v.getTime())))},this.toggleVacationEndDate=function(){var e;(e=this.preferences.defaults.Vacation).endDateEnabled&&(e.startDateEnabled&&e.endDate.getTime()<e.startDate.getTime()?(e.endDate=new Date(e.startDate.getTime()),e.endDate.addDays(1)):e.endDate.getTime()<v.getTime()&&(e.endDate=new Date(v.getTime())))},this.validateVacationStartDate=function(e){var t=p.preferences.defaults,a=!0;return t&&t.Vacation&&t.Vacation.enabled&&t.Vacation.startDateEnabled&&(a=(!t.Vacation.endDateEnabled||e.getTime()<t.Vacation.endDate.getTime())&&e.getTime()>=v.getTime()),a},this.validateVacationEndDate=function(e){var t=p.preferences.defaults,a=!0;return t&&t.Vacation&&t.Vacation.enabled&&t.Vacation.endDateEnabled&&(a=(!t.Vacation.startDateEnabled||e.getTime()>t.Vacation.startDate.getTime())&&e.getTime()>=v.getTime()),a}}e.$inject=["$q","$window","$state","$mdMedia","$mdSidenav","$mdDialog","$mdToast","sgSettings","sgFocus","Dialog","User","Account","Preferences","Authentication"],angular.module("SOGo.PreferencesUI").controller("PreferencesController",e)}();
//# sourceMappingURL=Preferences.js.map