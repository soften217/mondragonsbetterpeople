//CONTROLLER MODULE
angular.module('aceWeb')


.controller('AppCtrl', function($scope, $state, AUTH_EVENTS, AuthService)
{
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event)
  {
    event.preventDefault();
    AuthService.logout();
    $state.go('login');
  });

  $scope.$on(AUTH_EVENTS.notAuthorized, function(event)
  {
    event.preventDefault();
    $state.go('login');
  });

})





// <-------------------------- COMMON CONTROLLERS ----------------------------------------------->


.controller('LoginController', function(config, $scope, $http, $state, $localStorage, AuthService)
{
  $scope.initScope = function()
  {
    $scope.incorrectInput = false;
    $scope.invalidInput = false;
    $scope.disableLogin = false;
    $scope.loginText = "SIGN IN";
  }

  $scope.initScope();

  $scope.login = function(loginForm)
  {
    $scope.incorrectInput = false;
    $scope.invalidInput = false;

    if(loginForm.$valid)
    {
      $scope.disableLogin = true;
      $scope.loginText = "SIGNING IN";

      var loginDetails =
      {
        'email' : $scope.userEmail,
        'pword' : $scope.userPassword
      };

      $http({
        method: 'POST',
        url: config.apiUrl + '/login',
        data: loginDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .then(function(response) //eto yung gagawin ng function mo after mo makuha yung response from server
      {
        //success callback (handles all the success response 2xx status codes)
        console.log(response); //for checking

        AuthService.storeUserCredentials(response.data.token);

        if(AuthService.getRole() == 3)
        {
          $state.go('faculty.referralForm');
        }
        else if(AuthService.getRole() == 2)
        {
          $state.go('admin.reports');
        }
        else if(AuthService.getRole() == 1)
        {
          $state.go('superadmin.manageAdmin');
        }
      },
      function(response)
      {
        //error callback (handles all the error response 4xx status codes)
        console.log(response);

        $scope.errMsg = response.data.errMsg;
        $scope.incorrectInput = true;
        $scope.userPassword = undefined;

        $scope.disableLogin = false;
        $scope.loginText = "SIGN IN";
      })
      .finally(function()
      {
        //things to handle whether the response is success or not (ex: disable or hide loading)

      })
    }
    else
    {
      $scope.errMsg = "Invalid Email or Password";
      $scope.invalidInput = true;
    }
  }
})


// <------------------------------------------------------------------>


.controller('ForgotPasswordController', function(config, $scope, $http, $state, $location)
{
  $scope.initScope = function()
  {
    $scope.showResetPassForm = false;

    $scope.incorrectInput = false;
    $scope.invalidInput = false;
    $scope.validEmail = false;
    $scope.pwordChanged = false;
    $scope.invalidPword = false;
    $scope.disableLogin = false;
    $scope.resetText = "SEND REQUEST";
    $scope.resetText2 = "RESET PASSWORD";
  }

  $scope.initScope();

  $scope.verifyEmail = function(loginForm)
  {
    $scope.incorrectInput = false;
    $scope.invalidInput = false;
    $scope.validEmail = false;

    if(loginForm.$valid)
    {
      $scope.disableLogin = true;
      $scope.resetText = "SENDING REQUEST";

      var resetDetails =
      {
        'email' : $scope.userEmail
      };

      $http({
        method: 'POST',
        url: config.apiUrl + '/forgotPassword',
        data: resetDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .then(function(response)
      {
        //for checking
        console.log(response);

        $scope.validEmail = true;
      },
      function(response)
      {
        //for checking
        console.log(response);

        if(response.status == 400)
        {
          $scope.errMsg = response.data.errMsg;
        }
        else
        {
          $scope.errMsg = "Web service unavailable";
        }
        $scope.incorrectInput = true;
      })
      .finally(function()
      {
        $scope.disableLogin = false;
        $scope.resetText = "SEND REQUEST";
      });
    }
    else
    {
      $scope.errMsg = "Invalid Email";
      $scope.invalidInput = true;
    }
  }

  $scope.verifyURL = function()
  {
    var verifyData =
    {
      'email' : $location.search()['email'],
      'hashcode' : $location.search()['hashcode']
    };

    $http({
      method: 'POST',
      url: config.apiUrl + '/verifyToken',
      data: verifyData,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.showResetPassForm = true;
    },
    function(response)
    {
      //for checking
      console.log(response);

      if(response.status == 400)
      {
        $state.go('errorInvalidLink');
      }
    })
    .finally(function()
    {

    });
  } //closing tag verifyURL

  $scope.confirmReset = function(loginForm)
  {
    $scope.incorrectInput = false;
    $scope.invalidInput = false;
    $scope.pwordChanged = false;
    $scope.invalidPword = false;

    if(loginForm.$valid)//validation if password and password confirmation field match
    {
      $scope.disableLogin = true;
      $scope.resetText2 = "RESETTING PASSWORD";

      var resetPassDetails =
      {
        'email' : $location.search()['email'],
        'hashcode' : $location.search()['hashcode'],
        'pword' : $scope.userPassword
      };

      $http({
        method: 'POST',
        url: config.apiUrl + '/resetPassword',
        data: resetPassDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .then(function(response)
      {
        //for checking
        console.log(response);

        $scope.pwordChanged = true;
      },
      function(response)
      {
        //for checking
        console.log(response);

        if(response.status == 400)
        {
          $scope.errMsg = response.data.errMsg;
        }
        else
        {
          $scope.errMsg = "Web service unavailable";
        }
        $scope.incorrectInput = true;
      })
      .finally(function()
      {
        $scope.disableLogin = false;
        $scope.resetText2 = "RESET PASSWORD";
      });
    }
    else
    {
      if(loginForm.password.$invalid)
      {
        $scope.errMsg = "Invalid Password";
        $scope.invalidInput = true;
      }
      else
      {
        $scope.errMsg = "Password don't match";
        $scope.invalidPword = true;
      }
    }
  }

}) //closing tag


// <------------------------------------------------------------------>


.controller('AccountSetupController', function(config, $scope, $http, $state, $location)
{
  $scope.initScope = function()
  {
    $scope.showAccountSetupForm = false;

    $scope.invalidInput = false;
    $scope.accountActivated = false;

    $scope.disableLogin = false;
    $scope.activateText = "ACTIVATE ACCOUNT";
  }

  $scope.initScope();

  $scope.verifyURL = function()
  {
    if($location.search()['email'] && $location.search()['hashcode']) // check if both the url parameters exist
    {
      var verifyData =
      {
        'email' : $location.search()['email'], //get the value of one of the parameter in the current url
        'hashCode' : $location.search()['hashcode'] //get the value of one of the parameter in the current url
      };

      $http({
        method: 'GET',
        url: config.apiUrl + '/verify',
        params: verifyData, //instead of data, we pass the verifyData object as a parameter in url since we're using GET instead of POST. Thus, the url should be like this ../../../ace/webservice/public/verify?email="INSERT VALUE HERE"&hashCode="INSERT VALUE HERE".
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .then(function(response)
      {
        //for checking
        console.log(response);

        $scope.showAccountSetupForm = true;
      },
      function(response)
      {
        //for checking
        console.log(response);

        $state.go('errorInvalidLink');
      })
      .finally(function()
      {

      });
    }
    else
    {
      //for checking
      $state.go('errorInvalidLink'); ////go to error page (tell the user that the link is invalid)
    }
  };

  $scope.submitFurtherDetails = function(accountForm)
  {
    $scope.invalidInput = false;
    $scope.accountActivated = false;

    if(accountForm.$valid)
    {
      $scope.disableLogin = true;
      $scope.activateText = "ACTIVATING ACCOUNT";

      var accountDetails =
      {
        'email' : $location.search()['email'], //get the value of one of the parameter in the current url
        'hashCode' : $location.search()['hashcode'], //get the value of one of the parameter in the current url
        'contactNumber' : $scope.userContactNumber,
        'pword' : $scope.userPassword
      };

      $http({
        method: 'POST',
        url: config.apiUrl + '/accountSetup',
        data: accountDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}

      })
      .then(function(response)
      {
        //for checking
        console.log(response);
        $scope.accountActivated = true;
      },
      function(response)
      {
        //for checking
        console.log(response);

        $scope.invalidInput = true;
        $scope.errMsg = response.data.errMsg;
      })
      .finally(function()
      {
        $scope.disableLogin = false;
        $scope.activateText = "ACTIVATE ACCOUNT";
      });
    }
    else
    {
      $scope.invalidInput = true;

      if(loginForm.password.$invalid)
      {
        $scope.errMsg = "Invalid Password";
      }
      else if(loginForm.confirmpassword.$error.compareTo)
      {
        $scope.errMsg = "Password don't match";
      }
      else if(loginForm.contactnumber.$invalid)
      {
        $scope.errMsg = "Invalid Contact Number";
      }
      else
      {
        $scope.errMsg = "Invalid Input";
      }
    }
  }
})





// <-------------------------- FACULTY CONTROLLERS ---------------------------------->


.controller('FacultyController', function(config, $scope, $http, $state, $localStorage, AuthService, $rootScope, $interval)
{
  $scope.logout = function()
  {
    AuthService.logout();
  }

  $rootScope.getNotif = function()
  {
    var accountDetails =
    {
      'email' : AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/getNotifList',
      data: accountDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.isLoading = false;

      $rootScope.referralUpdateCount = response.data.referralUpdateCount;
      $rootScope.newMessageCount = response.data.newMessageCount;
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {

    });
  }

  $scope.initScope = function()
  {
    $scope.isLoading = true;
    $scope.userName = AuthService.getName();
    $rootScope.getNotif();
  }

  $scope.initScope();

  $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);

  $scope.$on('$destroy',function()
  {
    if($rootScope.notifPoll)
    {
      $interval.cancel($rootScope.notifPoll);
    }
  })
}) //controller


// <------------------------------------------------------------------>


.controller('ReferralFormController', function(config, $scope, $http, $state, $localStorage, AuthService, $filter)
{

  $scope.initScope = function()
  {
    $scope.submitBtn = "Submit";
    $scope.disableSubmitBtn = false;
    $scope.currentYear = new Date().getFullYear();
    $scope.firstSY = ($scope.currentYear - 1) + " - " + $scope.currentYear;
    $scope.secondSY = $scope.currentYear + " - " + ($scope.currentYear + 1);
    $scope.thirdSY = ($scope.currentYear + 1) + " - " + ($scope.currentYear + 2);
    $scope.reasons = [
    {
      name: 'Student is habitually absent or late (reaching half of allowed absences)',
      value: 1,
      check: false
    }, {
      name: 'Student is underachieving (smart but lazy)',
      value: 2,
      check: false
    }, {
      name: 'Student shows inability to perform in class (signs of failing)',
      value: 3,
      check: false
    }, {
      name: 'Student plans to transfer to another class',
      value: 4,
      check: false
    }, {
      name: 'Student shows violent/disruptive behavior',
      value: 5,
      check: false
    }, {
      name: 'Student shows emotional distress',
      value: 6,
      check: false
    }, {
      name: 'Other Reasons (please specify):',
      value: undefined,
      check: false
    }];
  }

  $scope.initScope();

  $scope.resetInput = function()
  {
    $scope.refForm.year.$setUntouched();
    $scope.refForm.course.$setUntouched();

    $scope.year = undefined;
    $scope.course = undefined;
  }

  $scope.$watch("reasons", function(n, o)
  {
    var trues = $filter("filter")(n, {
      check: true
    });
    $scope.checkedReasons = trues.length <= 0;
  }, true);

  $scope.submitReferral=function(form)
  {
    if(form.$valid && !$scope.checkedReasons)
    {
      if($scope.reasons[6].check && $scope.reasons[6].value.length == 0)
      {
        $scope.invalidOtherReason = true;
        $scope.showCustomModal("ERROR", "Please specify the reason!");
      }
      else
      {
        $scope.submitBtn = "Submitting";
        $scope.disableSubmitBtn = true;

        var referralDetails =
        {
          'schoolYear' : $scope.schoolYear,
          'email' : AuthService.getEmail(),
          'schoolTerm' : $scope.schoolTerm,
          'studId' : $scope.studId,
          'studFName': $scope.studFName,
          'studLName' : $scope.studLName,
          'subjName' : $scope.subjName,
          'department' : parseInt($scope.department),
          'course' : $scope.course,
          'year' : $scope.year,
          'reason': $scope.reasons
        };
        $http({
          method: 'POST',
          url: config.apiUrl + '/referralForm',
          data: referralDetails,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(response)
        {
          console.log(response);
          $scope.resetForm();
          $scope.showCustomModal("SUCCESS", response.data.successMsg);
        },
        function(response)
        {
          //for checking
          console.log(response);
          $scope.showCustomModal("ERROR", response.data.errorMsg);
        })
        .finally(function()
        {
          $scope.submitBtn = "Submit";
          $scope.disableSubmitBtn = false;
        });
      }
    }
    else if(form.$valid && $scope.checkedReasons)
    {
      $scope.showCustomModal("ERROR", "Please select a reason!");
    }
  }

  $scope.updateOtherTextArea = function(model)
  {
    if(!model)
    {
      $scope.invalidOtherReason = true;
    }
    else
    {
      $scope.invalidOtherReason = false;
    }
  }

  $scope.updateOtherCheckbox = function()
  {
    $scope.invalidOtherReason = false;
    $scope.reasons[6].value = undefined;
  }

  $scope.getStudentInfo = function(val)
  {
    var studentInfo =
    {
      'studId' : val
    }
    return $http({
      method: 'POST',
      url: config.apiUrl + '/getStudentInfo',
      data: studentInfo,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      console.log(response);

      var students = JSON.parse(response.data.studInfoList)
      return students;
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {

    });
  }

  $scope.onSelect = function ($item, $model, $label)
  {
    $scope.studFName = $item.first_name;
    $scope.studLName = $item.last_name;
    $scope.department = '' + $item.department_id;
    $scope.course = '' + $item.program;
    $scope.year = '' + $item.level;
  };

  $scope.resetForm = function ()
  {
    $scope.refForm.$setUntouched();
    $scope.refForm.$setPristine();

    $scope.schoolYear = undefined;
    $scope.schoolTerm = undefined;
    $scope.studId = undefined;
    $scope.studFName = undefined;
    $scope.studLName = undefined;
    $scope.subjName = undefined;
    $scope.course = undefined;
    $scope.year = undefined;
    $scope.department = undefined;
    $scope.reasons[0].check = false;
    $scope.reasons[1].check = false;
    $scope.reasons[2].check = false;
    $scope.reasons[3].check = false;
    $scope.reasons[4].check = false;
    $scope.reasons[5].check = false;
    $scope.reasons[6].check = false;
    $scope.reasons[6].value = undefined;
  }

  $scope.showCustomModal = function(modalTitle, modalMsg)
  {
    BootstrapDialog.alert({
      title: modalTitle,
      message: modalMsg,
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false
    });
  }

})


// <------------------------------------------------------------------>


.controller('ReferralHistoryController', function(config, $scope, $http, $state, $localStorage, AuthService, $interval, $rootScope, $filter)
{
  $scope.getReportList = function()
  {
    var reportDetails =
    {
      'email' : AuthService.getEmail()
    }
    $http({
      method: 'POST',
      url: config.apiUrl + '/referralHistory',
      data: reportDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.reports = JSON.parse(response.data.reportsList);

      if($scope.reports.length > 0)
      {
        $scope.SYList = $filter('orderBy')($scope.reports, 'school_year', true);
        $scope.SYList = $filter('unique')($scope.SYList, 'school_year');

        if(!$scope.initList || $scope.selectedSY == undefined || $scope.currentSYSize > $scope.SYList.length)
        {
          $scope.selectedSY = $scope.SYList[0].school_year;
        }

        for(var counter=0; counter < $scope.reports.length; counter++)
        {
          //convert string date into javascript date object
          strDate = $scope.reports[counter].report_date.replace(/-/g,'/');
          $scope.reports[counter].report_date = new Date(strDate);
        }

        $scope.currentSYSize = $scope.SYList.length;
        $scope.subReports = $filter('filter')($scope.reports, {school_year: $scope.selectedSY});
      }
      else
      {
        $scope.selectedSY = undefined;
      }

      $scope.totalItems = $scope.reports.length;
      $scope.isLoading = false;
      $scope.initList = true;
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {

    });
  }

  $scope.initScope = function()
  {
    $scope.isLoading = true;
    $scope.initList = false;
    $scope.selectedSY = undefined;
    $scope.searchBox = undefined;
    $scope.reportList = {};
    $scope.reportList.report_id = [];
    $scope.mainCheckbox = false;

    //for pagination
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 8;

    $scope.getReportList();
  } //scope initScope

  $scope.initScope();

  $scope.reportPoll = $interval($scope.getReportList, 3000);

  $scope.$on('$destroy',function()
  {
    if($scope.reportPoll)
    {
      $interval.cancel($scope.reportPoll);
    }
  })

  $scope.$watch("reportList.report_id", function()
  {
    $scope.mainCheckbox = false;

    if($scope.reports && $scope.filtered.length == $scope.reportList.report_id.length)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.$watch("searchBox", function()
  {
    $scope.reportList.report_id = [];
    $scope.mainCheckbox = false;

    if($scope.reports && $scope.filtered.length == $scope.reportList.report_id.length && $scope.filtered.length != 0)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.controlCheckbox = function ()
  {
    $scope.reportList.report_id = [];

    if($scope.mainCheckbox)
    {
      for(var counter=0; counter < $scope.filtered.length; counter++)
      {
        $scope.reportList.report_id.push($scope.filtered[counter].report_id);
      }
    }
  }

  $scope.updateSYList = function ()
  {
    $scope.reportList.report_id = [];
    $scope.mainCheckbox = false;
    $scope.subReports = $filter('filter')($scope.reports, {school_year: $scope.selectedSY});
    $scope.subReports = $filter('filter')($scope.subReports, $scope.searchBox);
  }

  $scope.disableActionBtn = function ()
  {
    if($scope.reportList.report_id == undefined || $scope.reportList.report_id.length == 0)
    {
      return true;
    }
    return false;
  }

  $scope.selectAllRead = function ()
  {
    $scope.reportList.report_id = [];

    for(var counter=0; counter < $scope.filtered.length; counter++)
    {
      if($scope.filtered[counter].is_updated == 0)
      {
        $scope.reportList.report_id.push($scope.filtered[counter].report_id);
      }
    }
  }

  $scope.selectAllUnread = function ()
  {
    $scope.reportList.report_id = [];

    for(var counter=0; counter < $scope.filtered.length; counter++)
    {
      if($scope.filtered[counter].is_updated == 1)
      {
        $scope.reportList.report_id.push($scope.filtered[counter].report_id);
      }
    }
  }

  $scope.markAsRead = function()
  {
    $interval.cancel($rootScope.notifPoll);
    $interval.cancel($scope.reportPoll);

    var reportDetails =
    {
      'reportId' : $scope.reportList
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/markFacultyReport',
      data: reportDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })

    .then(function(response)
    {
      console.log(response);

      $scope.getReportList();
      $rootScope.getNotif();
    },
    function(response)
    {
      console.log(response);
      //for checking
    })
    .finally(function()
    {
      $scope.reportList.report_id = [];
      $scope.mainCheckbox = false;

      $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);
      $scope.reportPoll = $interval($scope.getReportList, 3000);
    });
  }

  $scope.markAsUnread = function()
  {
    $interval.cancel($rootScope.notifPoll);
    $interval.cancel($scope.reportPoll);

    var reportDetails =
    {
      'reportId' : $scope.reportList
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/markFacultyReportAsUnread',
      data: reportDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.getReportList();
      $rootScope.getNotif();
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {
      $scope.reportList.report_id = [];
      $scope.mainCheckbox = false;

      $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);
      $scope.reportPoll = $interval($scope.getReportList, 3000);
    });
  }

  $scope.viewReport = function(report)
  {
    $scope.selectedReport = report;
    $scope.reasonList = report.report_reasons;

    if(report.counselor_note == null)
    {
      report.counselor_note_view = "N/A";
    }
    else
    {
      report.counselor_note_view = report.counselor_note;
    }

    if(report.referral_comment == null)
    {
      report.referral_comment_view = "N/A";
    }
    else
    {
      report.referral_comment_view = report.referral_comment;
    }

    if($scope.selectedReport.is_updated == 1)
    {
      $interval.cancel($rootScope.notifPoll);
      $interval.cancel($scope.reportPoll);

      var reportDetails =
      {
        'reportId' : $scope.selectedReport.report_id
      }

      $http({
        method: 'POST',
        url: config.apiUrl + '/markFacultyReport',
        data: reportDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .then(function(response)
      {
        //for checking
        console.log(response);

        $scope.getReportList();
        $rootScope.getNotif();
      },
      function(response)
      {
        //for checking
        console.log(response);

      })
      .finally(function()
      {
        $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);
        $scope.reportPoll = $interval($scope.getReportList, 3000);
      });
    }
  }

  $scope.showCustomModal = function(modalTitle, modalMsg)
  {
    BootstrapDialog.alert({
      title: modalTitle,
      message: modalMsg,
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false
    });
  }
}) //closing tag controller


// <-------------------------------------------------------------------------------->


.controller('MessagesController', function(config, $scope, $http, $state, $filter, $localStorage, AuthService, $interval, $filter, $rootScope)
{

  $scope.getMessageList = function()
  {
    var messageDetails =
    {
      'email' : AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/messages',
      data: messageDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.messages = JSON.parse(response.data.messageList);

      for(var counter=0; counter < $scope.messages.length; counter++)
      {
        //convert string date into javascript date object
        strDate = $scope.messages[counter].message_date.replace(/-/g,'/');
        $scope.messages[counter].message_date = new Date(strDate);
      }

      $scope.uniqueMessages = $filter('orderBy')($scope.messages, 'message_date', true);
      $scope.uniqueMessages = $filter('unique')($scope.uniqueMessages, 'report_id');

      for(var counter=0; counter < $scope.uniqueMessages.length; counter++)
      {
        if($scope.uniqueMessages[counter].sender_email == AuthService.getEmail())
        {
          $scope.uniqueMessages[counter].is_read = $scope.uniqueMessages[counter].is_read_sender;
        }
      }
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {

    });
  } //scope getMessageList

  $scope.initScope = function()
  {
    $scope.sendBtn = "Send";
    $scope.userEmail = AuthService.getEmail();
    $scope.searchBox = undefined;
    $scope.markMessageList = {};
    $scope.markMessageList.report_id = [];
    $scope.mainCheckbox = false;

    //for pagination
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 8;

    $scope.getMessageList();
  } //scope initScope

  $scope.initScope();

  $scope.msgPoll = $interval($scope.getMessageList, 3000);

  $scope.$on('$destroy',function()
  {
    if($scope.msgPoll)
    {
      $interval.cancel($scope.msgPoll);
    }
  })

  $scope.$watch("markMessageList.report_id", function()
  {
    $scope.mainCheckbox = false;

    if($scope.messages && $scope.filtered.length == $scope.markMessageList.report_id.length)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.$watch("searchBox", function()
  {
    $scope.markMessageList.report_id = [];
    $scope.mainCheckbox = false;

    if($scope.messages && $scope.filtered.length == $scope.markMessageList.report_id.length && $scope.filtered.length != 0)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.disableActionBtn = function ()
  {
    if($scope.markMessageList.report_id == undefined || $scope.markMessageList.report_id.length == 0)
    {
      return true;
    }
    return false;
  }

  $scope.controlCheckbox = function ()
  {
    $scope.markMessageList.report_id = [];

    if($scope.mainCheckbox)
    {
      for(var counter=0; counter < $scope.filtered.length; counter++)
      {
        $scope.markMessageList.report_id.push($scope.filtered[counter].report_id);
      }
    }
  }

  $scope.selecAllRead = function ()
  {
    $scope.markMessageList.report_id = [];

    for(var counter=0; counter < $scope.filtered.length; counter++)
    {
      if($scope.filtered[counter].is_read == 1)
      {
        $scope.markMessageList.report_id.push($scope.filtered[counter].report_id);
      }
    }
  }

  $scope.selecAllUnread = function ()
  {
    $scope.markMessageList.report_id = [];

    for(var counter=0; counter < $scope.filtered.length; counter++)
    {
      if($scope.filtered[counter].is_read == 0)
      {
        $scope.markMessageList.report_id.push($scope.filtered[counter].report_id);
      }
    }
  }

  $scope.markAsRead = function()
  {
    $interval.cancel($rootScope.notifPoll);
    $interval.cancel($scope.msgPoll);

    var messageDetails =
    {
      'markMessageList' : $scope.markMessageList,
      'email': AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/markAsRead',
      data: messageDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $rootScope.getNotif();
      $scope.getMessageList();
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {
      $scope.markMessageList.report_id = [];
      $scope.mainCheckbox = false;
      $scope.msgPoll = $interval($scope.getMessageList, 3000);
      $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);
    });
  }

  $scope.markAsUnread = function()
  {
    $interval.cancel($rootScope.notifPoll);
    $interval.cancel($scope.msgPoll);

    var messageDetails =
    {
      'markMessageList' : $scope.markMessageList,
      'email': AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/markAsUnread',
      data: messageDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $rootScope.getNotif();
      $scope.getMessageList();
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {
      $scope.markMessageList.report_id = [];
      $scope.mainCheckbox = false;
      $scope.msgPoll = $interval($scope.getMessageList, 3000);
      $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);
    });
  }

  $scope.deleteMessageList = function()
  {
    $scope.deleteBtn = "Delete";

    BootstrapDialog.show({
      title: 'Delete Message',
      message: 'Are you sure you want to delete these messages?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      buttons:
      [{
        label: $scope.deleteBtn,
        cssClass: 'btn-danger',
        autospin: true,
        action: function(dialogRef)
        {
          $scope.deleteBtn = "Deleting";
          dialogRef.enableButtons(false);
          $interval.cancel($rootScope.notifPoll);
          $interval.cancel($scope.msgPoll);

          var messageDetails =
          {
            'markMessageList' : $scope.markMessageList,
            'email': AuthService.getEmail()
          }

          $http({
            method: 'POST',
            url: config.apiUrl + '/deleteMessage',
            data: messageDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            $rootScope.getNotif();
            $scope.getMessageList();

            $scope.showCustomModal("SUCCESS", response.data.successMsg);
          },
          function(response)
          {
            //for checking
            console.log(response);

            $scope.showCustomModal("ERROR", response.data.errorMsg);
          })
          .finally(function()
          {
            $scope.markMessageList.report_id = [];
            $scope.mainCheckbox = false;
            $scope.msgPoll = $interval($scope.getMessageList, 3000);
            $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);

            $scope.deleteBtn = "Delete";
            dialogRef.enableButtons(true);
            dialogRef.close();
          });
        }
      },
      {
        label: 'Cancel',
        action: function(dialogRef)
        {
          dialogRef.close();
        }
      }]
    });
  }

  $scope.deleteMessage = function(message)
  {
    $scope.deleteBtn = "Delete";

    BootstrapDialog.show({
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      buttons:
      [{
        label: $scope.deleteBtn,
        cssClass: 'btn-danger',
        autospin: true,
        action: function(dialogRef)
        {
          $scope.deleteBtn = "Deleting";
          dialogRef.enableButtons(false);
          $interval.cancel($rootScope.notifPoll);
          $interval.cancel($scope.msgPoll);

          var messageDetails =
          {
            'markMessageList' : message.report_id,
            'email': AuthService.getEmail()
          }

          $http({
            method: 'POST',
            url: config.apiUrl + '/deleteMessage',
            data: messageDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            $rootScope.getNotif();
            $scope.getMessageList();

            $scope.showCustomModal("SUCCESS", response.data.successMsg);
          },
          function(response)
          {
            //for checking
            console.log(response);

            $scope.showCustomModal("ERROR", response.data.errorMsg);
          })
          .finally(function()
          {
            $scope.msgPoll = $interval($scope.getMessageList, 3000);
            $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);

            $scope.deleteBtn = "Delete";
            dialogRef.enableButtons(true);
            dialogRef.close();
          });
        }
      },
      {
        label: 'Cancel',
        action: function(dialogRef)
        {
          dialogRef.close();
        }
      }]
    });
  }

  $scope.readMessage = function()
  {
    $interval.cancel($rootScope.notifPoll);
    $interval.cancel($scope.msgPoll);

    var messageDetails =
    {
      'reportId' : $scope.selectedMessage.report_id,
      'email': AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/readMessage',
      data: messageDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $rootScope.getNotif();
      $scope.getMessageList();
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {
      $scope.msgPoll = $interval($scope.getMessageList, 3000);
      $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);
    });
  }

  $scope.showPopup = function(message)
  {
    $scope.selectedMessage = message;
    $scope.composeEmail = undefined;
    $scope.scrollOnTop = false;
    $scope.showLimit = -4;

    $scope.readMessage();
  }

  $scope.showBroadcastModal = function()
  {
    $scope.broadcastEmailForm.$setPristine();
    $scope.composeBroadcastEmail = "";
    $scope.subject = undefined;
  }

  $('#myModal').on('shown.bs.modal', function ()
  {
    $("#customTextArea").focus();
    $('#scrollableDiv').scrollTop($('#scrollableDiv')[0].scrollHeight);
  })

  $('#myModal').on('hide.bs.modal', function ()
  {
    $('#scrollableDiv').scrollTop($('#scrollableDiv')[0].scrollHeight);
  })

  $scope.incrementShowLimit = function()
  {
    $scope.showLimit -= 2;
  }

  $scope.sendEmail = function()
  {
    if($scope.composeEmail != "" && $scope.composeEmail != undefined)
    {
      $scope.sendBtn = "Sending";
      $scope.isSending = true;
      $interval.cancel($rootScope.notifPoll);
      $interval.cancel($scope.msgPoll);

      if($scope.selectedMessage.receiver_email == AuthService.getEmail())
      {
        $scope.sender = $scope.selectedMessage.receiver_email;
        $scope.receiver = $scope.selectedMessage.sender_email;
      }
      else
      {
        $scope.sender = $scope.selectedMessage.sender_email;
        $scope.receiver = $scope.selectedMessage.receiver_email;
      }

      var messageDetails =
      {
        'sender' : $scope.sender,
        'receiver': $scope.receiver,
        'messageBody': $scope.composeEmail,
        'messageSubj': $scope.selectedMessage.message_subject,
        'reportId': $scope.selectedMessage.report_id
      }

      $http({
        method: 'POST',
        url: config.apiUrl + '/sendMessage',
        data: messageDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .then(function(response)
      {
        //for checking
        console.log(response);

        $scope.composeEmail = "";
        $scope.showLimit -= 1;
        $rootScope.getNotif();
        $scope.getMessageList();
      },
      function(response)
      {
        //for checking
        console.log(response);

      })
      .finally(function()
      {
        $scope.sendBtn = "Send";
        $scope.isSending = false;
        $scope.msgPoll = $interval($scope.getMessageList, 3000);
        $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);
      });
    }
  }

  $scope.broadcastEmail = function(form)
  {
    if(form.$valid)
    {
      $scope.sendBtn = "Sending";
      $scope.isSending = true;

      var str =  $scope.composeBroadcastEmail;
      var emailBody = str.replace(new RegExp('\r?\n','g'), '<br />');

      var messageDetails =
      {
        'messageBody': emailBody,
        'messageSubj': $scope.subject
      }
     
      $http({
        method: 'POST',
        url: config.apiUrl + '/broadcastEmail',
        data: messageDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .then(function(response)
      {
        //for checking
        console.log(response);

        $scope.showCustomModal("SUCCESS", response.data.successMsg);
      },
      function(response)
      {
        //for checking
        console.log(response);

        $scope.showCustomModal("ERROR", response.data.errorMsg);
      })
      .finally(function()
      {
        $('#broadcastModal').modal('hide');
        $scope.sendBtn = "Send";
        $scope.isSending = false;
      });
    }
  }

  $scope.showCustomModal = function(modalTitle, modalMsg)
  {
    BootstrapDialog.alert({
      title: modalTitle,
      message: modalMsg,
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false
    });
  }

}) //closing tag controller


// <------------------------------------------------------------------>


.controller('SettingsController', function(config, $scope, $http, $state, $location, $localStorage, AuthService)
{
  $scope.getContactNum = function ()
  {
    var accountDetails =
    {
      'email' : AuthService.getEmail()
    }
    $http({
      method: 'POST',
      url: config.apiUrl + '/getContactNum',
      data: accountDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.contactNum = response.data.contactNum;
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {

    });
  }

  $scope.initScope = function()
  {
    $scope.saveBtn = "Save";
    $scope.disableSaveBtn = false;
    $scope.getContactNum();
  } //scope initScope

  $scope.initScope();

  $scope.showPwordModal = function()
  {
    $scope.settingsForm.$setPristine();
    $scope.settingsForm.oldPassword.$setUntouched();
    $scope.settingsForm.userPassword.$setUntouched();
    $scope.settingsForm.userConfirmPassword.$setUntouched();
    $scope.oldPassword = "";
    $scope.userPassword = "";
    $scope.userConfirmPassword = "";
  }

  $scope.showContactModal = function()
  {
    $scope.settingsForm2.$setPristine();
    $scope.settingsForm2.newContactNum.$setUntouched();
    $scope.newContactNum = $scope.contactNum;
  }

  $scope.confirmContact = function(form)
  {
    if(form.$valid)
    {
      $scope.saveBtn = "Saving";
      $scope.disableSaveBtn = true;

      var changeContactDetails =
      {
        'email' : AuthService.getEmail(),
        'contactNum' : $scope.newContactNum
      };

      $http({
        method: 'POST',
        url: config.apiUrl + '/changeContact',
        data: changeContactDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })

      .then(function(response)
      {
        //for checking
        console.log(response);

        $scope.contactNum = $scope.newContactNum;

        $('#contactModal').modal('hide');
        $scope.showCustomModal("SUCCESS", response.data.successMsg);
      },
      function(response)
      {
        console.log(response);

      })
      .finally(function()
      {
        $scope.saveBtn = "Save";
        $scope.disableSaveBtn = false;
      });
    }
  }

  //compares old password to new password
  $scope.changePassword = function(settingsForm)
  {
    if(settingsForm.userPassword.$valid && settingsForm.userConfirmPassword.$valid)
    {
      $scope.settingsForm.oldPassword.$setValidity('invalidOldPword', true);
    }

    if(settingsForm.oldPassword.$valid && settingsForm.userConfirmPassword.$valid)
    {
      $scope.settingsForm.userPassword.$setValidity('samePword', true);
    }

    if(settingsForm.$valid)
    {
      $scope.saveBtn = "Saving";
      $scope.disableSaveBtn = true;

      var changePassDetails =
      {
        'email' : AuthService.getEmail(),
        'pword' : $scope.userPassword,
        'oldPword': $scope.oldPassword
      };

      $http({
        method: 'POST',
        url: config.apiUrl + '/changePasswordInSettings',
        data: changePassDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })

      .then(function(response)
      {
        console.log(response);

        $scope.pwordLength = "";

        for(var counter = 0; counter < $scope.userPassword.length; counter++)
        {
          $scope.pwordLength += '•';
        }

        $('#pwordModal').modal('hide');
        $scope.showCustomModal("SUCCESS", response.data.successMsg);
      },
      function(response)
      {
        console.log(response);

        if(response.status == 400)
        {
          if(response.data.errorMsg == 'Invalid password')
          {
            $scope.settingsForm.oldPassword.$setValidity('invalidOldPword', false);
          }
          if(response.data.errorMsg == 'Invalid new password')
          {
            $scope.settingsForm.userPassword.$setValidity('samePword', false);
          }
        }
      })
      .finally(function()
      {
        $scope.saveBtn = "Save";
        $scope.disableSaveBtn = false;
      });
    }
  }

  $scope.showCustomModal = function(modalTitle, modalMsg)
  {
    BootstrapDialog.alert({
      title: modalTitle,
      message: modalMsg,
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false
    });
  }

}) //closing tag ng controller





// <------------------------------ ADMIN CONTROLLERS ------------------------------------>


.controller('AdminController', function(config, $scope, $http, $state, AuthService, $rootScope, $interval)
{
  $scope.logout = function()
  {
    AuthService.logout();
  }

  $rootScope.getNotif = function()
  {
    var accountDetails =
    {
      'email' : AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/getAdminNotifList',
      data: accountDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.isLoading = false;

      $rootScope.uncounseledReportCount = response.data.uncounseledReportCount;
      $rootScope.newMessageCount = response.data.newMessageCount;
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {

    });
  }

  $scope.initScope = function()
  {
    $scope.isLoading = true;
    $scope.userName = AuthService.getName();
    $rootScope.getNotif();
  }

  $scope.initScope();

  $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);

  $scope.$on('$destroy',function()
  {
    if($rootScope.notifPoll)
      $interval.cancel($rootScope.notifPoll);
  })

})


// <------------------------------------------------------------------>


.controller('ReportsController', function(config, $scope, $http, $state, $localStorage, AuthService, $interval, $rootScope, $filter)
{
  $scope.getReportList = function()
  {
    var reportDetails =
    {
      'email' : AuthService.getEmail()
    }
    $http({
      method: 'POST',
      url: config.apiUrl + '/reports',
      data: reportDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.reports = JSON.parse(response.data.reportsList);

      if($scope.reports.length > 0)
      {
        $scope.SYList = $filter('orderBy')($scope.reports, 'school_year', true);
        $scope.SYList = $filter('unique')($scope.SYList, 'school_year');

        if(!$scope.initList || $scope.selectedSY == undefined || $scope.currentSYSize > $scope.SYList.length)
        {
          $scope.selectedSY = $scope.SYList[0].school_year;
        }

        for(var counter=0; counter < $scope.reports.length; counter++)
        {
          //convert string date into javascript date object
          strDate = $scope.reports[counter].report_date.replace(/-/g,'/');
          $scope.reports[counter].report_date = new Date(strDate);
        }

        $scope.currentSYSize = $scope.SYList.length;
        $scope.subReports = $filter('filter')($scope.reports, {school_year: $scope.selectedSY});
      }
      else
      {
        $scope.selectedSY = undefined;
      }

      $scope.totalItems = $scope.reports.length;
      $scope.isLoading = false;
      $scope.initList = true;
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {

    });
  }

  $scope.initScope = function()
  {
    $scope.sendBtn = "Send";
    $scope.isLoading = true;
    $scope.initList = false;
    $scope.selectedSY = undefined;
    $scope.currentDateNum = Date.today().toString('MMddyy');
    $scope.searchBox = undefined;
    $scope.reportList = {};
    $scope.reportList.report_id = [];
    $scope.mainCheckbox = false;

    //for pagination
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 8;

    $scope.getReportList();
  } //scope initScope

  $scope.initScope();

  $scope.reportPoll = $interval($scope.getReportList, 3000);

  $scope.$on('$destroy',function()
  {
    if($scope.reportPoll)
    {
      $interval.cancel($scope.reportPoll);
    }
  })

  $scope.$watch("reportList.report_id", function()
  {
    $scope.mainCheckbox = false;

    if($scope.reports && $scope.filtered.length == $scope.reportList.report_id.length)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.$watch("searchBox", function()
  {
    $scope.reportList.report_id = [];
    $scope.mainCheckbox = false;

    if($scope.reports && $scope.filtered.length == $scope.reportList.report_id.length && $scope.filtered.length != 0)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.controlCheckbox = function ()
  {
    $scope.reportList.report_id = [];

    if($scope.mainCheckbox)
    {
      for(var counter=0; counter < $scope.filtered.length; counter++)
      {
        $scope.reportList.report_id.push($scope.filtered[counter].report_id);
      }
    }
  }

  $scope.updateSYList = function ()
  {
    $scope.reportList.report_id = [];
    $scope.mainCheckbox = false;
    $scope.subReports = $filter('filter')($scope.reports, {school_year: $scope.selectedSY});
    $scope.subReports = $filter('filter')($scope.subReports, $scope.searchBox);
  }

  $scope.disableActionBtn = function ()
  {
    if($scope.reportList.report_id == undefined || $scope.reportList.report_id.length == 0)
    {
      return true;
    }
    return false;
  }

  $scope.selectAllRead = function ()
  {
    $scope.reportList.report_id = [];

    for(var counter=0; counter < $scope.filtered.length; counter++)
    {
      if($scope.filtered[counter].is_updated == 0)
      {
        $scope.reportList.report_id.push($scope.filtered[counter].report_id);
      }
    }
  }

  $scope.selectAllUnread = function ()
  {
    $scope.reportList.report_id = [];

    for(var counter=0; counter < $scope.filtered.length; counter++)
    {
      if($scope.filtered[counter].is_updated == 1)
      {
        $scope.reportList.report_id.push($scope.filtered[counter].report_id);
      }
    }
  }

  $scope.readReport = function(report)
  {
    var reportDetails =
    {
      'reportId' : $scope.selectedReport.report_id,
      'isRead': $scope.selectedReport.is_read,
      'email' : $scope.selectedReport.email
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/readReport',
      data: reportDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.getReportList();
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {

    });
  }

  $scope.sendEmail = function(report, form)
  {
    if(form.$valid)
    {
      $scope.sendBtn = "Sending";
      $scope.isSending = true;

      var messageDetails =
      {
        'sender' : AuthService.getEmail(),
        'receiver': report.email,
        'messageBody': $scope.composeEmail,
        'messageSubj': $scope.subject,
        'reportId': report.report_id
      }
      $http({
        method: 'POST',
        url: config.apiUrl + '/sendMessage',
        data: messageDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .then(function(response)
      {
        //for checking
        console.log(response);

        $scope.composeEmail = undefined;

        $scope.showCustomModal("SUCCESS", response.data.successMsg);
      },
      function(response)
      {
        $scope.showCustomModal("ERROR", response.data.errorMsg);
      })
      .finally(function()
      {
        $('#messageModal').modal('hide');
        $scope.sendBtn = "Send";
        $scope.isSending = false;
      });
    }
  }

  $scope.deleteReport = function(report_id)
  {
    $scope.deleteBtn = "Delete";

    BootstrapDialog.show({
      title: 'Delete Report',
      message: 'Are you sure you want to delete this report?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      buttons:
      [{
        label: $scope.deleteBtn,
        cssClass: 'btn-danger',
        autospin: true,
        action: function(dialogRef)
        {
          $scope.deleteBtn = "Deleting";
          dialogRef.enableButtons(false);
          $interval.cancel($rootScope.notifPoll);
          $interval.cancel($scope.reportPoll);

          var reportDetails =
          {
            'reportList' : report_id
          }

          $http({
            method: 'POST',
            url: config.apiUrl + '/deleteReport',
            data: reportDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            $scope.getReportList();
            $rootScope.getNotif();

            $scope.showCustomModal("SUCCESS", response.data.successMsg);
          },
          function(response)
          {
            $scope.showCustomModal("ERROR", response.data.errorMsg);
          })
          .finally(function()
          {
            $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);
            $scope.reportPoll = $interval($scope.getReportList, 3000);

            $scope.deleteBtn = "Delete";
            dialogRef.enableButtons(true);
            dialogRef.close();
          });
        }
      },
      {
        label: 'Cancel',
        action: function(dialogRef)
        {
          dialogRef.close();
        }
      }]
    });
  }

  $scope.deleteReportList = function()
  {
    $scope.deleteBtn = "Delete";

    BootstrapDialog.show({
      title: 'Delete Reports',
      message: 'Are you sure you want to delete selected reports?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      buttons:
      [{
        label: $scope.deleteBtn,
        cssClass: 'btn-danger',
        autospin: true,
        action: function(dialogRef)
        {
          $scope.deleteBtn = "Deleting";
          dialogRef.enableButtons(false);
          $interval.cancel($rootScope.notifPoll);
          $interval.cancel($scope.reportPoll);

          var reportDetails =
          {
            'reportList' : $scope.reportList
          }

          $http({
            method: 'POST',
            url: config.apiUrl + '/deleteReport',
            data: reportDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            $scope.getReportList();
            $rootScope.getNotif();

            $scope.showCustomModal("SUCCESS", response.data.successMsg);
          },
          function(response)
          {
            //for checking
            console.log(response);

            $scope.showCustomModal("ERROR", response.data.errorMsg);
          })
          .finally(function()
          {
            $scope.reportList.report_id = [];
            $scope.mainCheckbox = false;
            $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);
            $scope.reportPoll = $interval($scope.getReportList, 3000);

            $scope.deleteBtn = "Delete";
            dialogRef.enableButtons(true);
            dialogRef.close();
          });
        }
      },
      {
        label: 'Cancel',
        action: function(dialogRef)
        {
          dialogRef.close();
        }
      }]
    });
  }

  $scope.markAsRead = function()
  {
    var reportDetails =
    {
      'reportList' : $scope.reportList,
      'email': AuthService.getEmail()
    };

    $http({
      method: 'POST',
      url: config.apiUrl + '/markReport',
      data: reportDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })

    .then(function(response)
    {
      console.log(response);

      $scope.getReportList();
    },
    function(response)
    {
      console.log(response);
      //for checking
    })
    .finally(function()
    {
      $scope.reportList.report_id = [];
      $scope.mainCheckbox = false;
    });
  }

  $scope.markAsUnread = function()
  {
    var reportDetails =
    {
      'reportList' : $scope.reportList,
      'email': AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/markReportAsUnread',
      data: reportDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.getReportList();
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {
      $scope.reportList.report_id = [];
      $scope.mainCheckbox = false;
    });
  }

  $scope.updateReportStatus = function(report, form)
  {
    if(form.$valid)
    {
      $scope.updateBtn = "Updating";
      $scope.disableUpdateBtn = true;

      $interval.cancel($rootScope.notifPoll);
      $interval.cancel($scope.reportPoll);

      var updateDetails =
      {
        'email' : report.email,
        'reportId' : report.report_id,
        'prevReportStatus' : report.report_status_id,
        'reportStatus' : parseInt($scope.status),
        'comment' : $scope.comment
      }

      $http({
        method: 'POST',
        url: config.apiUrl + '/updateStatus',
        data: updateDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })

      .then(function(response)
      {
        console.log(response);

        $scope.getReportList();
        $rootScope.getNotif();

        $scope.showCustomModal("SUCCESS", response.data.successMsg);
      },
      function(response)
      {
        $scope.showCustomModal("ERROR", response.data.errorMsg);
      })
      .finally(function()
      {
        $('#noteModal').modal('hide');
        $scope.updateBtn = "Update";
        $scope.disableUpdateBtn = false;

        $rootScope.notifPoll = $interval($rootScope.getNotif, 3000);
        $scope.reportPoll = $interval($scope.getReportList, 3000);
      });
    }
  }

  $scope.viewReport = function(report)
  {
    $scope.selectedReport = report;
    $scope.reasonList = report.report_reasons;
    $scope.readReport();

    if(report.counselor_note == null)
    {
      report.counselor_note_view = "N/A";
    }
    else
    {
      report.counselor_note_view = report.counselor_note;
    }

    if(report.referral_comment == null)
    {
      report.referral_comment_view = "N/A";
    }
    else
    {
      report.referral_comment_view = report.referral_comment;
    }
  }

  $scope.updateStatus = function(report)
  {
    $scope.selectedReport = report;
    $scope.status = report.report_status_id + "";

    if(report.counselor_note != null)
    {
      $scope.comment = report.counselor_note;
    }
    else
    {
      $scope.comment = "";
    }

    $scope.updateBtn = "Update";
    $scope.disableUpdateBtn = false;
  }

  $scope.createMessage = function(report)
  {
    $('#messageModal').modal('show');

    $scope.selectedReport = report;
    $scope.subject = "Referral for " + report.student_fullname + ": " + report.subject_name;
    $scope.receiver = report.faculty_fullname;
    $scope.composeEmail = "";
    $scope.sendBtn = "Send";
    $scope.disableSendBtn = false;
  }

  //export report to PDF
  $scope.exportReportPDF = function(report)
  {
    var doc = new jsPDF('portrait');

    var rowHeightData = 46;
    var rowHeightLabel = 38;

    doc.setFontSize(26);
    doc.setFont("courier");
    doc.setFontType("bold");
    doc.text('REPORT DETAILS', 68, 16);

    doc.setFontSize(15);
    doc.text('Date:', 15, rowHeightLabel);

    doc.setFontSize(12.5);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.report_date.toString('MM/dd/yy hh:mm tt'), 53);
    var lineNum1 = lines.length;
    doc.text(15, rowHeightData, lines);

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('School Year:', 70, rowHeightLabel);

    doc.setFontSize(12.5);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.school_year, 53);
    var lineNum2 = lines.length;
    doc.text(70, rowHeightData, lines);

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('Term:', 130, rowHeightLabel);

    doc.setFontSize(12.5);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.term + "", 62);
    var lineNum3 = lines.length;
    doc.text(130, rowHeightData, lines);

    var rowLineNum = Math.max(lineNum1, lineNum2, lineNum3);

    rowHeightData = rowHeightData + 8 + (rowLineNum * 6);
    rowHeightLabel = rowHeightData + 8;

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('Student ID:', 15, rowHeightData);

    doc.setFontSize(12.5);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.student_id, 53);
    var lineNum1 = lines.length;
    doc.text(15, rowHeightLabel, lines);

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('Student Name:', 70, rowHeightData);

    doc.setFontSize(12.5);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.student_fullname, 53);
    var lineNum2 = lines.length;
    doc.text(70, rowHeightLabel, lines);

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('Course:', 130, rowHeightData);

    doc.setFontSize(12.5);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.program, 62);
    var lineNum3 = lines.length;
    doc.text(130, rowHeightLabel, lines);

    var rowLineNum = Math.max(lineNum1, lineNum2, lineNum3);

    rowHeightData = rowHeightData + 16 + (rowLineNum * 6);
    rowHeightLabel = rowHeightData + 8;

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('Level:', 15, rowHeightData);

    doc.setFontSize(12.5);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.level, 53);
    var lineNum1 = lines.length;
    doc.text(15, rowHeightLabel, lines);

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('Referred by:', 70, rowHeightData);

    doc.setFontSize(12.5);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.faculty_fullname, 53);
    var lineNum2 = lines.length;
    doc.text(70, rowHeightLabel, lines);

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('Subject:', 130, rowHeightData);

    doc.setFontSize(12.5);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.subject_name, 62);
    var lineNum3 = lines.length;
    doc.text(130, rowHeightLabel, lines);

    var rowLineNum = Math.max(lineNum1, lineNum2, lineNum3);

    rowHeightData = rowHeightData + 16 + (rowLineNum * 6);
    rowHeightLabel = rowHeightData + 8;

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('Status:', 15, rowHeightData);

    doc.setFontSize(12.5);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.report_status, 53);
    var lineNum1 = lines.length;
    doc.text(15, rowHeightLabel, lines);

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('Counselor\'s Note:', 70, rowHeightData);

    doc.setFontSize(12);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.counselor_note_view, 122);
    var lineNum2 = lines.length;
    doc.text(70, rowHeightLabel, lines);

    var rowLineNum = Math.max(lineNum1, lineNum2);

    rowHeightData = rowHeightData + 12 + (rowLineNum * 5);
    rowHeightLabel = rowHeightData + 8;

    doc.line(195, rowHeightData, 15, rowHeightData);

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('Reason(s) for Referral:', 15, rowHeightData + 12);

    doc.setFontSize(11.3);
    doc.setFontType("normal");

    var lineCount = 0;

    for(var counter = 0; counter < report.report_reasons.length; counter++)
    {
      if(report.report_reasons[counter] == "N/A")
      {
        var lines = doc.splitTextToSize(report.report_reasons[counter], 181);
      }
      else
      {
        var lines = doc.splitTextToSize(counter + 1 + ". " + report.report_reasons[counter], 181);
      }

      var lineNum = lines.length;
      lineCount += lineNum;
      doc.text(15, rowHeightLabel + 12 + (counter * lineNum * 6), lines);
    }

    rowHeightData = rowHeightData + 16 + (lineCount * 6);
    rowHeightLabel = rowHeightData + 19;

    doc.setFontSize(15);
    doc.setFontType("bold");
    doc.text('Other Reasons:', 15, rowHeightData + 11);

    doc.setFontSize(11.3);
    doc.setFontType("normal");
    var lines = doc.splitTextToSize(report.referral_comment_view, 181);
    doc.text(15, rowHeightLabel, lines);

    doc.save(report.student_fullname.replace(/[^A-Z0-9]/ig, '').toLowerCase() + $scope.currentDateNum + '.pdf');
  }

  $scope.showCustomModal = function(modalTitle, modalMsg)
  {
    BootstrapDialog.alert({
      title: modalTitle,
      message: modalMsg,
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false
    });
  }
}) //closing tag controller


// <-------------------------------------------------------------------------------->


.controller('ManageStudentController', function(config, $scope, $http, $state, AuthService)
{
  $scope.getStudentList = function()
  {
    var adminDetails = 
    {
      'email' : AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/listStudent',
      data: adminDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.students = JSON.parse(response.data.studentList);
      $scope.isLoading = false;
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {

    });
  }

  $scope.initScope = function()
  {
    $scope.isLoading = true;
    $scope.deleteBtn = "Delete";
    $scope.updateBtn = "Update";
    $scope.disableUpdateBtn = false;

    $scope.searchBox = undefined;
    $scope.studentList = {};
    $scope.studentList.student_id = [];
    $scope.mainCheckbox = false;

    //for pagination
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 8;

    $scope.getStudentList();
  } //scope initScope

  $scope.initScope();

  $scope.$watch("studentList.student_id", function()
  {
    $scope.mainCheckbox = false;

    if($scope.students && $scope.filtered.length == $scope.studentList.student_id.length)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.$watch("searchBox", function()
  {
    $scope.studentList.student_id = [];
    $scope.mainCheckbox = false;

    if($scope.students && $scope.filtered.length == $scope.studentList.student_id.length && $scope.filtered.length != 0)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.controlCheckbox = function ()
  {
    $scope.studentList.student_id = [];

    if($scope.mainCheckbox)
    {
      for(var counter=0; counter < $scope.filtered.length; counter++)
      {
        $scope.studentList.student_id.push($scope.filtered[counter].student_id);
      }
    }
  }

  $scope.disableDeleteBtn = function ()
  {
    if($scope.studentList.student_id == undefined || $scope.studentList.student_id.length == 0)
    {
      return true;
    }
    return false;
  }

  $scope.deleteStudent = function(student)
  {
    BootstrapDialog.show({
      title: 'Delete Student',
      message: 'Are you sure you want to delete this student?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      buttons: 
      [{
        label: $scope.deleteBtn,
        cssClass: 'btn-danger',
        autospin: true,
        action: function(dialogRef)
        {
          $scope.deleteBtn = "Deleting";
          dialogRef.enableButtons(false);

          var studentDetails =
          {
            'studentList': student.student_id,
            'email' : AuthService.getEmail()
          }

          $http({
            method: 'POST',
            url: config.apiUrl + '/deleteStudent',
            data: studentDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            $scope.getStudentList();

            $scope.showCustomModal("SUCCESS", response.data.successMsg);
          },
          function(response)
          {
            //for checking
            console.log(response);

            $scope.showCustomModal("ERROR", response.data.errorMsg);
          })
          .finally(function()
          {
            $scope.deleteBtn = "Delete";
            dialogRef.enableButtons(true);
            dialogRef.close();
          });
        }
      },
      {
        label: 'Cancel',
        action: function(dialogRef)
        {
          dialogRef.close();
        }
      }]
    });
  } // $scope.deleteAdmin

  $scope.deleteStudentList = function()
  {
    BootstrapDialog.show({
      title: 'Delete Students',
      message: 'Are you sure you want to delete selected student/s?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      buttons: 
      [{
        label: $scope.deleteBtn,
        cssClass: 'btn-danger',
        autospin: true,
        action: function(dialogRef)
        {
          $scope.deleteBtn = "Deleting";
          dialogRef.enableButtons(false);

          var studentDetails =
          {
            'studentList' : $scope.studentList,
            'email' : AuthService.getEmail()
          }

          $http({
            method: 'POST',
            url: config.apiUrl + '/deleteStudent',
            data: studentDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            $scope.getStudentList();

            $scope.showCustomModal("SUCCESS", response.data.successMsg);
          },
          function(response)
          {
            //for checking
            console.log(response);

            $scope.showCustomModal("ERROR", response.data.errorMsg);
          })
          .finally(function()
          {
            $scope.deleteBtn = "Delete";
            dialogRef.enableButtons(true);

            $scope.studentList.student_id = [];
            $scope.mainCheckbox = false;

            dialogRef.close();
          });
        }
      },
      {
        label: 'Cancel',
        action: function(dialogRef)
        {
          dialogRef.close();
        }
      }]
    });
  }

  $scope.showPopup = function(student)
  {
    $scope.selectedStudent = student;

    $scope.department = student.department_id;
    $scope.studId = student.student_id;
    $scope.originalId = student.student_id;
    $scope.studLName = student.last_name;
    $scope.studFName = student.first_name;
    $scope.program = student.program_id + "";
    $scope.level = student.level_id + "";
  }

  $scope.updateStudent = function(form)
  {
    if(form.$valid)
    {
      $scope.updateBtn = "Updating";
      $scope.disableUpdateBtn = true;

      var studentDetails =
      {
        'email' : AuthService.getEmail(),
        'originalId': $scope.originalId,
        'studentId' : $scope.studId,
        'lastName' : $scope.studLName,
        'firstName' : $scope.studFName,
        'program' : $scope.program,
        'level' : $scope.level
      };

      $http({
        method: 'POST',
        url: config.apiUrl + '/updateStudent',
        data: studentDetails,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .then(function(response)
      {
        //for checking
        console.log(response);

        $scope.getStudentList();
        $('#editModal').modal('hide');
        $scope.showCustomModal("SUCCESS", response.data.successMsg);
      },
      function(response)
      {
        //for checking
        console.log(response);

        $('#editModal').modal('hide');
        $scope.showCustomModal("ERROR", response.data.errorMsg);
      })
      .finally(function()
      {
        $scope.updateBtn = "Update";
        $scope.disableUpdateBtn = false;
      });
    }   
  }

  $scope.showCustomModal = function(modalTitle, modalMsg)
  {
    BootstrapDialog.alert({
      title: modalTitle,
      message: modalMsg,
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false
    });
  }

})


// <------------------------------------------------------------------>


.controller('ManageFacultyController', function(config, $scope, $http, $state, AuthService)
{
  $scope.getFacultyList = function()
  {
    $http({
      method: 'POST',
      url: config.apiUrl + '/listFaculty',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.facultyAccounts = JSON.parse(response.data.facultyList);
      $scope.totalItems = $scope.facultyAccounts.length;
      $scope.isLoading = false;
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {

    });

  }

  $scope.initScope = function()
  {
    $scope.isLoading = true;

    $scope.createBtn = "Create Account";
    $scope.disableRegBtn = false;
    $scope.deleteBtn = "Delete";

    $scope.searchBox = undefined;
    $scope.facultyList = {};
    $scope.facultyList.email = [];
    $scope.mainCheckbox = false;

    //for pagination
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 8;

    $scope.getFacultyList();
  } //scope initScope

  $scope.initScope();

  $scope.showRegFacultyModal = function()
  {
    $scope.createBtn = "Create Account";
    $scope.disableRegBtn = false;

    $scope.regFacultyForm.$setPristine();
    $scope.regFacultyForm.facultyEmail.$setUntouched();
    $scope.regFacultyForm.facultyFirstName.$setUntouched();
    $scope.regFacultyForm.facultyLastName.$setUntouched();
    $scope.facultyEmail = "";
    $scope.facultyFirstName = "";
    $scope.facultyLastName = "";
  }

  $scope.registerFaculty = function(regFacultyForm)
  {
    if(regFacultyForm.facultyFirstName.$valid && regFacultyForm.facultyLastName.$valid)
    {
      $scope.regFacultyForm.facultyEmail.$setValidity('emailExist', true);

      if(regFacultyForm.$valid)
      {
        $scope.createBtn = "Creating Account";
        $scope.disableRegBtn = true;

        var registerDetails =
        {
          'email' : $scope.facultyEmail,
          'fName' : $scope.facultyFirstName,
          'lName' : $scope.facultyLastName
        };

        $http({
          method: 'POST',
          url: config.apiUrl + '/registerFaculty',
          data: registerDetails,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(response)
        {
          //for checking
          console.log(response);

          $scope.getFacultyList();

          $('#facultyRegModal').modal('hide');

          $scope.showCustomModal("SUCCESS", response.data.successMsg);
        },
        function(response)
        {
          //for checking
          console.log(response);

          if(response.status == 400)
          {
            $scope.regFacultyForm.facultyEmail.$setValidity(response.data.errorMsg, false);
          }
        })
        .finally(function()
        {
          $scope.createBtn = "Create Account";
          $scope.disableRegBtn = false;
        });
      }
    }
  }//registerFaculty

  $scope.deleteFaculty = function(email)
  {
    BootstrapDialog.show({
      title: 'Delete Faculty',
      message: 'Are you sure you want to delete this faculty?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      buttons:
      [{
        label: $scope.deleteBtn,
        cssClass: 'btn-danger',
        autospin: true,
        action: function(dialogRef)
        {
          $scope.deleteBtn = "Deleting";
          dialogRef.enableButtons(false);

          var facultyDetails =
          {
            'facultyList': email
          }

          $http({
            method: 'POST',
            url: config.apiUrl + '/deleteFaculty',
            data: facultyDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            $scope.getFacultyList();

            $scope.showCustomModal("SUCCESS", response.data.successMsg);
          },
          function(response)
          {
            //for checking
            console.log(response);

            $scope.showCustomModal("ERROR", response.data.errorMsg);
          })
          .finally(function()
          {
            $scope.deleteBtn = "Delete";
            dialogRef.enableButtons(true);
            dialogRef.close();
          });
        }
      },
      {
        label: 'Cancel',
        action: function(dialogRef)
        {
          dialogRef.close();
        }
      }]
    });
  } // $scope.deleteFaculty

  $scope.deleteFacultyList = function()
  {
    BootstrapDialog.show({
      title: 'Delete Faculty Accounts',
      message: 'Are you sure you want to delete selected accounts?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      buttons:
      [{
        label: $scope.deleteBtn,
        cssClass: 'btn-danger',
        autospin: true,
        action: function(dialogRef)
        {
          $scope.deleteBtn = "Deleting";
          dialogRef.enableButtons(false);

          var facultyDetails =
          {
            'facultyList' : $scope.facultyList
          }

          $http({
            method: 'POST',
            url: config.apiUrl + '/deleteFaculty',
            data: facultyDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            $scope.getFacultyList();

            $scope.showCustomModal("SUCCESS", response.data.successMsg);
          },
          function(response)
          {
            //for checking
            console.log(response);

            $scope.showCustomModal("ERROR", response.data.errorMsg);
          })
          .finally(function()
          {
            $scope.facultyList.email = [];
            $scope.mainCheckbox = false;

            $scope.deleteBtn = "Delete";
            dialogRef.enableButtons(true);
            dialogRef.close();
          });
        }
      },
      {
        label: 'Cancel',
        action: function(dialogRef)
        {
          dialogRef.close();
        }
      }]
    });
  }

  $scope.$watch("facultyList.email", function()
  {
    $scope.mainCheckbox = false;

    if($scope.facultyAccounts && $scope.filtered.length == $scope.facultyList.email.length)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.$watch("searchBox", function()
  {
    $scope.facultyList.email = [];
    $scope.mainCheckbox = false;

    if($scope.facultyAccounts && $scope.filtered.length == $scope.facultyList.email.length && $scope.filtered.length != 0)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.controlCheckbox = function ()
  {
    $scope.facultyList.email = [];

    if($scope.mainCheckbox)
    {
      for(var counter=0; counter < $scope.filtered.length; counter++)
      {
        $scope.facultyList.email.push($scope.filtered[counter].email);
      }
    }
  }

  $scope.disableDeleteBtn = function ()
  {
    if($scope.facultyList.email == undefined || $scope.facultyList.email.length == 0)
    {
      return true;
    }
    return false;
  }

  $scope.showCustomModal = function(modalTitle, modalMsg)
  {
    BootstrapDialog.alert({
      title: modalTitle,
      message: modalMsg,
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false
    });
  }

})


// <------------------------------------------------------------------>


.controller('SummaryController', function(config, $scope, $http, AuthService)
{
  //init function which will retrieve list of school year in the database
  $scope.getSY = function()
  {
    var userDetails =
    {
      'email' : AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/getSYList',
      data: userDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.SYList = JSON.parse(response.data.SYList);

      if($scope.SYList.length != 0)
      {
        $scope.selectedSY = $scope.SYList[$scope.SYList.length-1].school_year;

        $scope.getSummaryData();
      }
      else
      {
        $scope.isEmptySYList = true;
      }
      $scope.isLoading = false;
    },
    function(response)
    {

    })
    .finally(function()
    {

    });
  }

  //init function which will retrieve all the data in rendering the summary chart
  $scope.getSummaryData = function()
  {
    $scope.isLoadingChart = true;

    var userDetails =
    {
      'email' : AuthService.getEmail(),
      'schoolYear' : $scope.selectedSY
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/getChartData',
      data: userDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      var dept = response.data.department;
      var termDataObj = JSON.parse(response.data.termData);
      var programDataObj = JSON.parse(response.data.programData);
      var levelDataObj = JSON.parse(response.data.levelData);
      var reasonDataObj = JSON.parse(response.data.reasonData);
      var statusDataObj = JSON.parse(response.data.statusData);

      //labels

      if(dept == 1)
      {
        $scope.programLabels = [['','Humanities And','Social Sciences'],['','Accountancy Business','And Management'],['','Computer','Programming'],'Animation','Fashion Design','Multimedia Arts'];
        $scope.levelLabels = ['Grade 11','Grade 12'];
      }
      else
      {
        $scope.programLabels = [['','Software','Engineering'],['','Game','Development'],['','Web','Development'],'Animation',['','Multimedia','Arts And Design'],['','Fashion','Design'],['','Real Estate','Management'],['','Business','Administration']];
        $scope.levelLabels = ['First Year','Second Year','Third Year','Fourth Year'];
      }

      $scope.termLabels = ['First Term','Second Term','Third Term'];
      $scope.reasonLabels = ['Absent or Late','Underachieving','Failing','Plans to Transfer','Violent/Disruptive','Emotional Distress','Others'];
      $scope.statusLabels = ['Uncounseled','In Progress','Counseled'];

      //data

      $scope.termData = [[]];
      $scope.programData = [[]];
      $scope.levelData = [[]];
      $scope.reasonData = [[]];
      $scope.statusData = [[]];

      convertToArray(termDataObj[0], $scope.termData[0]);
      convertToArray(programDataObj[0], $scope.programData[0]);
      convertToArray(levelDataObj[0], $scope.levelData[0]);
      convertToArray(reasonDataObj[0], $scope.reasonData[0]);
      convertToArray(statusDataObj[0], $scope.statusData[0]);

      //series
      $scope.series = ['Number of reports'];

      //options
      $scope.termOptions = getOption("Term", $scope.termData[0]);
      $scope.programOptions = getOption("Program", $scope.programData[0]);
      $scope.levelOptions = getOption("Level", $scope.levelData[0]);
      $scope.reasonOptions = getOption("Reason", $scope.reasonData[0]);
      $scope.statusOptions = getOption("Status", $scope.statusData[0]);
    },
    function(response)
    {

    })
    .finally(function()
    {
      $scope.isLoadingChart = false;
    });
  }

  $scope.initScope = function()
  {
    $scope.isLoading = true;
    $scope.isLoadingChart = false;
    $scope.currentDate = Date.today().toString('dddd, MMMM d, yyyy');
    $scope.currentDateNum = Date.today().toString('MMddyy');
    $scope.isEmptySYList = false;

    $scope.getSY();
  } //scope initScope

  $scope.initScope();

  //user defined functions
  function convertToArray(obj, scopeArr)
  {
    angular.forEach(obj, function(value, key)
    {
      scopeArr.push(value);
    });
  }

  function arrayMax(array)
  {
    return array.reduce(function(a, b) {
      return Math.max(a, b);
    });
  }

  function getXOffset(doc, str)
  {
    return strOffset = (doc.internal.pageSize.width / 2) - (doc.getStringUnitWidth(str) * doc.internal.getFontSize() / 6);
  }

  function getOption(chartName, dataArr)
  {
    var option =
    {
        scales:
        {
          yAxes:
          [{
              id: 'y-axis-1',
              type: 'linear',
              display: true,
              position: 'left',
              ticks:
              {
                min: 0, max: (Math.ceil(arrayMax(dataArr) / 10) * 10) + 30, stepSize: 10
              },
              scaleLabel:
              {
                display: true,
                labelString: 'Number of Reports'
              }
          }]
        },
        title:
        {
          display: true,
          text: 'Reports Per ' + chartName,
          padding: 30,
          fontSize: 30,
          fontFamily: 'gotham-book'
        }
        ,
        tooltips:
        {
          enabled: true,
          mode: 'single',
          callbacks: {
            title: function(tooltipItems, data) {
              return '';
            }
          }
        }
      };
      return option;
  }

  //download image function
  $scope.downloadImage = function(event, chartId)
  {
    var sy = $scope.selectedSY.split(/\s*-\s*/);
    var elemRef = document.getElementById(event.target.id);

    elemRef.href = document.getElementById(chartId).toDataURL('image/png', 1.0);
    elemRef.download = chartId + '_chart_' + $scope.currentDateNum + '_' + sy[0] + sy[1] + '.png';
  }

  //download pdf function
  $scope.downloadPDF = function(chartId)
  {
    html2canvas($("#" + chartId),
    {
      background: "#ffffff",
      onrendered: function(canvas)
      {
        var sy = $scope.selectedSY.split(/\s*-\s*/);
        var myImage = canvas.toDataURL("image/jpeg");

        var doc = new jsPDF('landscape');

        doc.addImage(myImage, 'JPEG', 23, 15, 250, 160);
        doc.save(chartId + '_chart_' + $scope.currentDateNum + '_' + sy[0] + sy[1] + '.pdf');
      }
    });
  }

}) //closing tag controller


// <------------------------------------------------------------------>


.controller('DatabaseController', function(config, $scope, $http, $state, $localStorage, AuthService)
{

  // -------------------------------------

  /*var t = '<div class="modal-header">'+
        '<h1>This is the title</h1>'+
        '</div>'+
        '<div class="modal-body">'+
        '<p>Enter a value to pass to <code>close</code> as the result: <input ng-model="result" /></p>'+
        '</div>'+
        '<div class="modal-footer">'+
        '<button ng-click="close(result)" class="btn btn-primary" >Close</button>'+
        '</div>';

  var dialog = $dialog.dialog ({
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  t, // OR: templateUrl: 'path/to/view.html',
    controller: 'TestDialogController'
  });

  $scope.$on('fileAdded', function (evt, file) {
    alert('opening dialog');
    dialog.open().then(function(result){
      if(result) {
        alert('dialog closed with result: ' + result);
      }
    });
  });

  $scope.open = function(){
    dialog.open().then(function(result){
      if(result) {
        alert('dialog closed with result: ' + result);
      }
    });
  };

  function TestDialogController($scope, dialog){
    $scope.close = function(result){
      dialog.close(result);
      };
  } */

  //------------------------------------------

  $scope.databaseConfirmation = function(){

    var userDetails =
    {
      'email' : AuthService.getEmail(),
      'password' : $scope.userPassword,
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/databaseConfirm',
      data: userDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      alert('Valid');

    },
    function(response)
    {
      if(response.data.errMsg == 'Credentials invalid.')
      {
        alert("hELLO ANFBEjn")
      }
    })
    .finally(function()
    {
        $scope.userPassword = undefined;
    });

  }
}) //closing tag controller





// <--------------------------- SUPER ADMIN CONTROLLERS ------------------------->


.controller('SuperAdminController', function(config, $scope, $http, $state, AuthService)
{
  $scope.initScope = function()
  {
    $scope.userName = AuthService.getName();
  }

  $scope.initScope();

  $scope.logout = function()
  {
    AuthService.logout();
  }
})


// <----------------------------------------------------------------------------------------->


.controller('ManageAdminController', function(config, $scope, $http, $state, AuthService)
{

  $scope.getAdminList = function()
  {
    $http({
      method: 'POST',
      url: config.apiUrl + '/listAdmin',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.adminAccounts = JSON.parse(response.data.adminList);
      $scope.totalItems = $scope.adminAccounts.length;
      $scope.isLoading = false;
    },
    function(response)
    {
      //for checking
      console.log(response);

    })
    .finally(function()
    {

    });
  }

  $scope.initScope = function()
  {
    $scope.isLoading = true;

    $scope.createBtn = "Create Account";
    $scope.disableRegBtn = false;
    $scope.deleteBtn = "Delete";

    $scope.searchBox = undefined;
    $scope.adminList = {};
    $scope.adminList.email = [];
    $scope.mainCheckbox = false;

    //for pagination
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 8;

    $scope.getAdminList();
  } //scope initScope

  $scope.initScope();

  $scope.showRegAdminModal = function()
  {
    $scope.createBtn = "Create Account";
    $scope.disableRegBtn = false;

    $scope.regAdminForm.$setPristine();
    $scope.regAdminForm.adminEmail.$setUntouched();
    $scope.regAdminForm.adminFirstName.$setUntouched();
    $scope.regAdminForm.adminLastName.$setUntouched();
    $scope.regAdminForm.adminDepartment.$setUntouched();
    $scope.adminEmail = "";
    $scope.adminFirstName = "";
    $scope.adminLastName = "";
    $scope.adminDepartment = "";
  }

  $scope.registerAdmin = function(regAdminForm)
  {
    if(regAdminForm.adminFirstName.$valid && regAdminForm.adminLastName.$valid && regAdminForm.adminDepartment.$valid)
    {
      $scope.regAdminForm.adminEmail.$setValidity('emailExist', true);

      if(regAdminForm.$valid)
      {
        $scope.createBtn = "Creating Account";
        $scope.disableRegBtn = true;

        var registerDetails =
        {
          'email' : $scope.adminEmail,
          'fName' : $scope.adminFirstName,
          'lName' : $scope.adminLastName,
          'department' : parseInt($scope.adminDepartment)
        };

        $http({
          method: 'POST',
          url: config.apiUrl + '/registerAdmin',
          data: registerDetails,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(response)
        {
          //for checking
          console.log(response);

          $scope.getAdminList();

          $('#adminRegModal').modal('hide');

          $scope.showCustomModal("SUCCESS", response.data.successMsg);
        },
        function(response)
        {
          //for checking
          console.log(response);

          if(response.status == 400)
          {
            $scope.regAdminForm.adminEmail.$setValidity(response.data.errorMsg, false);
          }
        })
        .finally(function()
        {
          $scope.createBtn = "Create Account";
          $scope.disableRegBtn = false;
        });
      }
    }
  }

  $scope.deleteAdmin = function(email)
  {
    BootstrapDialog.show({
      title: 'Delete Administrator',
      message: 'Are you sure you want to delete this administrator?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      buttons:
      [{
        label: $scope.deleteBtn,
        cssClass: 'btn-danger',
        autospin: true,
        action: function(dialogRef)
        {
          $scope.deleteBtn = "Deleting";
          dialogRef.enableButtons(false);

          var adminDetails =
          {
            'adminList': email
          }

          $http({
            method: 'POST',
            url: config.apiUrl + '/deleteAdmin',
            data: adminDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            $scope.getAdminList();

            $scope.showCustomModal("SUCCESS", response.data.successMsg);
          },
          function(response)
          {
            //for checking
            console.log(response);

            $scope.showCustomModal("ERROR", response.data.errorMsg);
          })
          .finally(function()
          {
            $scope.deleteBtn = "Delete";
            dialogRef.enableButtons(true);
            dialogRef.close();
          });
        }
      },
      {
        label: 'Cancel',
        action: function(dialogRef)
        {
          dialogRef.close();
        }
      }]
    });
  } // $scope.deleteAdmin

  $scope.deleteAdminList = function()
  {
    BootstrapDialog.show({
      title: 'Delete Administrators',
      message: 'Are you sure you want to delete selected accounts?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      buttons:
      [{
        label: $scope.deleteBtn,
        cssClass: 'btn-danger',
        autospin: true,
        action: function(dialogRef)
        {
          $scope.deleteBtn = "Deleting";
          dialogRef.enableButtons(false);

          var adminDetails =
          {
            'adminList' : $scope.adminList
          }

          $http({
            method: 'POST',
            url: config.apiUrl + '/deleteAdmin',
            data: adminDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            $scope.getAdminList();

            $scope.showCustomModal("SUCCESS", response.data.successMsg);
          },
          function(response)
          {
            //for checking
            console.log(response);

            $scope.showCustomModal("ERROR", response.data.errorMsg);
          })
          .finally(function()
          {
            $scope.adminList.email = [];
            $scope.mainCheckbox = false;

            $scope.deleteBtn = "Delete";
            dialogRef.enableButtons(true);
            dialogRef.close();
          });
        }
      },
      {
        label: 'Cancel',
        action: function(dialogRef)
        {
          dialogRef.close();
        }
      }]
    });
  }

  $scope.$watch("adminList.email", function()
  {
    $scope.mainCheckbox = false;

    if($scope.adminAccounts && $scope.filtered.length == $scope.adminList.email.length)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.$watch("searchBox", function()
  {
    $scope.adminList.email = [];
    $scope.mainCheckbox = false;

    if($scope.adminAccounts && $scope.filtered.length == $scope.adminList.email.length && $scope.filtered.length != 0)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }, true);

  $scope.controlCheckbox = function ()
  {
    $scope.adminList.email = [];

    if($scope.mainCheckbox)
    {
      for(var counter=0; counter < $scope.filtered.length; counter++)
      {
        $scope.adminList.email.push($scope.filtered[counter].email);
      }
    }
  }

  $scope.disableDeleteBtn = function ()
  {
    if($scope.adminList.email == undefined || $scope.adminList.email.length == 0)
    {
      return true;
    }
    return false;
  }

  $scope.showCustomModal = function(modalTitle, modalMsg)
  {
    BootstrapDialog.alert({
      title: modalTitle,
      message: modalMsg,
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false
    });
  }
})


// <------------------------------------------------------------------>


//template
.controller('', function($scope, $http, $state)
{


  $scope.functionName = function()
  {

  }


})
