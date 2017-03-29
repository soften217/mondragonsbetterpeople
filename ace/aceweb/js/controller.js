//CONTROLLER MODULE
angular.module('aceWeb.controller', [])


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

        if(response.status == 400)
        {
          $scope.errMsg = response.data.errMsg;
          $scope.incorrectInput = true;
          $scope.userPassword = undefined;
        }
      })
      .finally(function()
      {
        //things to handle whether the response is success or not (ex: disable or hide loading)
        $scope.disableLogin = false;
        $scope.loginText = "SIGN IN";
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
          $scope.incorrectInput = true;
        }
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
    if($location.search()['email'] && $location.search()['hashcode'])
    {
      var verifyData =
      {
        'email' : $location.search()['email'],
        'hashCode' : $location.search()['hashcode']
      };

      $http({
          method: 'GET',
          url: config.apiUrl + '/verifyToken',
          params: verifyData,
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
    }
    else
    {
      $state.go('errorInvalidLink');
    }
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
        'hashCode' : $location.search()['hashcode'],
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
          $scope.incorrectInput = true;
        }
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
        //validation if password and password confirmation field dont match
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

  $scope.getNotif = function()
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
    $scope.getNotif();
  }

  $scope.initScope();

  $rootScope.notifPoll = $interval($scope.getNotif, 3000);

  $scope.$on('$destroy',function()
  {
    if($rootScope.notifPoll)
      $interval.cancel($rootScope.notifPoll);
  })


}) //controller


// <------------------------------------------------------------------>


.controller('ReferralFormController', function(config, $scope, $http, $state, $localStorage, AuthService, $filter)
{
  $scope.resetForm = function ()
  {
    $scope.refForm.$setPristine();
    $scope.refForm.$setUntouched();

    $scope.schoolYear = undefined;
    $scope.schoolTerm = undefined;
    $scope.studId = undefined;
    $scope.studFName = undefined;
    $scope.studLName = undefined;
    $scope.subjName = undefined;
    $scope.course = undefined;
    $scope.year = undefined;
    $scope.department = undefined;
    $scope.reasons[6].check = false;
  }

  $scope.initScope = function()
  {
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

  $scope.submitReferral=function()
  {
    var referralDetails =
    {
      'schoolYear' : $scope.schoolYear,
      'email' : AuthService.getEmail(),
      'schoolTerm' : $scope.schoolTerm,
      'studId' : $scope.studId,
      'studFName': $scope.studFName,
      'studLName' : $scope.studLName,
      'subjName' : $scope.subjName,
      'department' : $scope.department,
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
      //console.log($scope.referralResponse['insertReport']);
      //$state.go('login');
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
})


// <------------------------------------------------------------------>


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

        //add fullname for each message
        if($scope.messages[counter].sender_email == AuthService.getEmail())
        {
          $scope.messages[counter].sender_fullName = "Me";
        }
        else
        {
          $scope.messages[counter].sender_fullName = $scope.messages[counter].sender_fname + " " + $scope.messages[counter].sender_lname;
        }

        //if subject is null
        if($scope.messages[counter].message_subject == null)
        {
          $scope.messages[counter].message_subject = "(No Subject)";
        }
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
    $scope.userEmail = AuthService.getEmail();
    $scope.myFilter = 'sender_fullName';
    $scope.searchPlacholder = 'Name';
    $scope.searchBox = undefined;
    $scope.markMessageList = {};
    $scope.markMessageList.report_id = [];
    $scope.mainCheckbox = false;

    //for pagination
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;

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
      for(var counter=0; counter < $scope.uniqueMessages.length; counter++)
      {
        $scope.markMessageList.report_id.push($scope.uniqueMessages[counter].report_id);
      }
    }
  }

  $scope.updateMainCheckbox = function ()
  {
    if($scope.markMessageList.report_id.length == $scope.uniqueMessages.length)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }

  $scope.selecAllRead = function ()
  {
    $scope.markMessageList.report_id = [];

    for(var counter=0; counter < $scope.uniqueMessages.length; counter++)
    {
      if($scope.uniqueMessages[counter].is_read == 1)
      {
        $scope.markMessageList.report_id.push($scope.uniqueMessages[counter].report_id);
      }
    }
  }

  $scope.selecAllUnread = function ()
  {
    $scope.markMessageList.report_id = [];

    for(var counter=0; counter < $scope.uniqueMessages.length; counter++)
    {
      if($scope.uniqueMessages[counter].is_read == 0)
      {
        $scope.markMessageList.report_id.push($scope.uniqueMessages[counter].report_id);
      }
    }
  }

  $scope.changeFilterTo = function(filterProperty)
  {
    $scope.searchBox = undefined;

    $scope.myFilter = filterProperty;

    if(filterProperty == 'sender_fullName')
    {
      $scope.searchPlacholder = 'Name';
    }
    else if(filterProperty == 'message_subject')
    {
      $scope.searchPlacholder = 'Subject';
    }
    else if(filterProperty == 'message_date')
    {
      $scope.searchPlacholder = 'Date';
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

      for(var counter=0; counter < $scope.uniqueMessages.length; counter++)
      {
        if($.inArray($scope.uniqueMessages[counter].report_id, $scope.markMessageList.report_id) > -1 && $scope.uniqueMessages[counter].is_read == 0)
        {
          $scope.uniqueMessages[counter].is_read = 1;
          $rootScope.newMessageCount -= 1;
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
      $scope.markMessageList.report_id = [];
      $scope.mainCheckbox = false;
      $scope.msgPoll = $interval($scope.getMessageList, 3000);
      $rootScope.notifPoll = $interval($scope.getNotif, 3000);
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

      for(var counter=0; counter < $scope.uniqueMessages.length; counter++)
      {
        if($.inArray($scope.uniqueMessages[counter].report_id, $scope.markMessageList.report_id) > -1 && $scope.uniqueMessages[counter].is_read == 1)
        {
          $scope.uniqueMessages[counter].is_read = 0;
          $rootScope.newMessageCount += 1;
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
      $scope.markMessageList.report_id = [];
      $scope.mainCheckbox = false;
      $scope.msgPoll = $interval($scope.getMessageList, 3000);
      $rootScope.notifPoll = $interval($scope.getNotif, 3000);
    });
  }

  $scope.deleteMessageList = function()
  {
    BootstrapDialog.confirm({
      title: 'Delete Message',
      message: 'Are you sure you want to delete these messages?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      btnCancelLabel: 'Cancel',
      btnOKLabel: 'Delete',
      btnOKClass: 'btn-danger',
      callback: function(result)
      {
        if(result)
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
            url: config.apiUrl + '/deleteMessage',
            data: messageDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            for(var counter=$scope.uniqueMessages.length - 1; counter >= 0 ; counter--)
            {
              if($.inArray($scope.uniqueMessages[counter].report_id, $scope.markMessageList.report_id) > -1)
              {
                if($scope.uniqueMessages[counter].is_read == 0)
                {
                  $rootScope.newMessageCount -= 1;
                }
                $scope.uniqueMessages.splice(counter,1);
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
            $scope.markMessageList.report_id = [];
            $scope.mainCheckbox = false;
            $scope.msgPoll = $interval($scope.getMessageList, 3000);
            $rootScope.notifPoll = $interval($scope.getNotif, 3000);
          });
        }
      }
    });
  }

  $scope.deleteMessage = function(message)
  {
    BootstrapDialog.confirm({
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      btnCancelLabel: 'Cancel',
      btnOKLabel: 'Delete',
      btnOKClass: 'btn-danger',
      callback: function(result)
      {
        if(result)
        {
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

            for(var counter=$scope.uniqueMessages.length - 1; counter >= 0 ; counter--)
            {
              if($scope.uniqueMessages[counter].report_id == message.report_id)
              {

                if($scope.uniqueMessages[counter].is_read == 0)
                {
                  $rootScope.newMessageCount -= 1;
                }
                $scope.uniqueMessages.splice(counter,1);
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
            $scope.markMessageList.report_id = [];
            $scope.mainCheckbox = false;
            $scope.msgPoll = $interval($scope.getMessageList, 3000);
            $rootScope.notifPoll = $interval($scope.getNotif, 3000);
          });
        }
      }
    });
  }

  $scope.readMessage = function()
  {
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

      for(var counter=0; counter < $scope.uniqueMessages.length; counter++)
      {
        if($scope.uniqueMessages[counter].report_id == $scope.selectedMessage.report_id && $scope.uniqueMessages[counter].receiver_email == AuthService.getEmail() && $scope.uniqueMessages[counter].is_read == 0)
        {
          $scope.uniqueMessages[counter].is_read = 1;
          $rootScope.newMessageCount -= 1;
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
  }

  $scope.showPopup = function(message)
  {
    $scope.selectedMessage = message;
    $scope.composeEmail = undefined;
    $scope.scrollOnTop = false;
    $scope.showLimit = -4;
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

  $('#customTextArea').focus(function()
  {
    $scope.readMessage();
  })

  $scope.incrementShowLimit = function()
  {
    $scope.showLimit -= 2;
  }

  $scope.sendEmail = function()
  {
    if($scope.composeEmail != "" && $scope.composeEmail != undefined)
    {
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

      $scope.composeEmail = "";
      $scope.showLimit -= 1;

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

  $scope.confirmContact = function(settingsForm2)
  {
    if(settingsForm2.$valid)
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
      },
      function(response)
      {
        console.log(response);

        if(response.status == 400)
        {
          if(response.data.errMsg == 'Failed Change Contact')
          {
            //empty for now
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

    if(settingsForm.$valid) //validation if password and password confirmation field match
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
      },
      function(response)
      {
        console.log(response);

        if(response.status == 400)
        {
          if(response.data.errMsg == 'Invalid password')
          {
            $scope.settingsForm.oldPassword.$setValidity('invalidOldPword', false);
          }
          if(response.data.errMsg == 'Invalid new password')
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

}) //closing tag ng controller





// <------------------------------ ADMIN CONTROLLERS ------------------------------------>


.controller('AdminController', function(config, $scope, $http, $state, AuthService)
{

  $scope.logout = function()
  {
    AuthService.logout();
  }
})


// <------------------------------------------------------------------>


.controller('ReportsController', function(config, $scope, $http, $state, $localStorage, AuthService)
{

  $scope.reportStatus = [
    { text: "Uncounseled", value:1},
    { text: "In Progress", value:2},
    { text: "Counseled", value:3}
  ];

  $scope.getReportList = function() {
    var reportDetails =
    {
      'email' : AuthService.getEmail()
      //'department' : AuthService.getRole()
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

      for(var counter=0; counter < $scope.reports.length; counter++)
      {
        //convert string date into javascript date object
        strDate = $scope.reports[counter].report_date.replace(/-/g,'/');
        $scope.reports[counter].report_date = new Date(strDate);

        $scope.reports[counter].sender_fullName = $scope.reports[counter].sender_fname + " " + $scope.reports[counter].sender_lname;

        if($scope.reports[counter].report_status_id == 1){
          $scope.reports[counter].report_status_id = "Uncounseled";
        } else if ($scope.reports[counter].report_status_id == 2){
          $scope.reports[counter].report_status_id = "In Progress";
        } else {
          $scope.reports[counter].report_status_id = "Counseled";
        }
      }

      $scope.totalItems = $scope.reports.length;
      //$scope.reports = ['apple', 'orange', 'green'];
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
    //$scope.userEmail = AuthService.getEmail();
    //$scope.myFilter = 'sender_fullName';
    //$scope.searchPlacholder = 'Name';
    $scope.searchBox = undefined;
    $scope.reportList = {};
    $scope.reportList.report_id = [];
    $scope.mainCheckbox = false;

    //for pagination
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;

    $scope.getReportList();
  } //scope initScope

  $scope.initScope();

  $scope.disableActionBtn = function ()
  {
    if($scope.reportList.report_id == undefined || $scope.reportList.report_id.length == 0)
    {
      return true;
    }
    return false;
  }


  $scope.deleteReportList = function()
  {
    BootstrapDialog.confirm({
      title: 'Delete Reports',
      message: 'Are you sure you want to delete selected reports?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      btnCancelLabel: 'Cancel',
      btnOKLabel: 'Delete',
      btnOKClass: 'btn-danger',
      callback: function(result)
      {
        if(result)
        {
          var facultyDetails =
          {
            'reportList' : $scope.reportList
            //'email': AuthService.getEmail()
          }

          $http({
            method: 'POST',
            url: config.apiUrl + '/deleteReport',
            data: facultyDetails,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
          .then(function(response)
          {
            //for checking
            console.log(response);

            for(var counter=$scope.reports.length - 1; counter >= 0 ; counter--)
            {
              if($.inArray($scope.reports[counter].report_id, $scope.reportList.report_id) > -1)
              {
                $scope.reports.splice(counter,1);
              }
            }
            //$rootScope.newMessageCount -= 1;
          },
          function(response)
          {
            //for checking
            console.log(response);

            if(response.status == 400)
            {
              if(response.data.errMsg == 'Cannot delete faculty')
              {
                //empty for now
              }
            }

          })
          .finally(function()
          {
            $scope.reportList.report_id = [];
            $scope.mainCheckbox = false;
          });
        }
      }
    });
  }

  $scope.controlCheckbox = function ()
  {
    $scope.reportList.report_id = [];

    if($scope.mainCheckbox)
    {
      for(var counter=0; counter < $scope.reports.length; counter++)
      {
        $scope.reportList.report_id.push($scope.reports[counter].report_id);
      }
    }
  }

  $scope.updateMainCheckbox = function ()
  {
    if($scope.reportList.report_id.length == $scope.reports.length)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }


  $scope.selectAllRead = function ()
  {
    $scope.reportList.report_id = [];

    for(var counter=0; counter < $scope.reports.length; counter++)
    {
      if($scope.reports[counter].is_read == 1)
      {
        $scope.reportList.report_id.push($scope.reports[counter].report_id);
      }
    }
  }

  $scope.selectAllUnread = function ()
  {
    $scope.reportList.report_id = [];

    for(var counter=0; counter < $scope.reports.length; counter++)
    {
      if($scope.reports[counter].is_read == 0)
      {
        $scope.reportList.report_id.push($scope.reports[counter].report_id);
      }
    }
  }


  $scope.deleteReport = function(report_id)
  {
    BootstrapDialog.confirm({
      title: 'Delete Report',
      message: 'Are you sure you want to delete this report?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      btnCancelLabel: 'Cancel',
      btnOKLabel: 'Delete',
      btnOKClass: 'btn-danger',
      callback: function(result)
      {
        if(result)
        {
          //$interval.cancel($rootScope.notifPoll);
          //$interval.cancel($scope.msgPoll);

          var reportDetails =
          {
            'reportList' : report_id
            //'email': AuthService.getEmail()
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

            var reportIndex = indexOfId($scope.reports, report_id);
            //$scope.adminAccounts.splice($scope.adminAccounts.email.indexOf(email),1);
            $scope.reports.splice(reportIndex,1);
          },
          function(response)
          {
            //for checking
            if(response.status == 400)
            {
              if(response.data.errMsg == 'Cannot delete report')
              {
                console.log("just go");
              }
            }

          })
          .finally(function()
          {
            $scope.reportList.report_id = [];
            $scope.mainCheckbox = false;
            //$scope.msgPoll = $interval($scope.getMessageList, 3000);
            //$rootScope.notifPoll = $interval($scope.getNotif, 3000);
          });
        }
      }
    });

    function indexOfId(array, report_id) {
    for (var i=0; i<array.length; i++) {
       if (array[i].report_id==report_id) return i;
    }
    return -1;

    }
  }

  $scope.readReport = function(report)
  {
    var reportDetails =
    {
      'reportId' : $scope.selectedReport.report_id,
      'email': AuthService.getEmail()
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

      for(var counter=0; counter < $scope.reports.length; counter++)
      {
        if($scope.reports[counter].report_id == $scope.selectedReport.report_id && $scope.reports[counter].is_read == 0)
        {
          $scope.reports[counter].is_read = 1;
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


  }

//------------------------------------------- MODALS -----------------

  $scope.showPopup = function(report)
  {
    $scope.selectedReport = report;
    console.log(report);
    //$scope.composeEmail = undefined;

  }

  $scope.viewReport = function(report)
  {
    $scope.selectedReport = report;
    console.log(report);

    $scope.comment = report.counselor_note;
    $scope.status = report.report_status_id;
    //$scope.composeEmail = undefined;
  }

  $scope.createMessage = function(report)
  {
    $('#messageModal').modal('show');

    $scope.selectedReport = report;
    console.log(report);
    $scope.composeEmail = undefined;

  }


//------------------------------------------- MODALS -----------------

  $scope.sendEmail = function(replyEmail, reportId, studentName, subjectName)
  {
    $scope.subject = "Referral for  " + studentName + ": " + subjectName;

    $scope.showLimit -= 1;

    var messageDetails =
    {
      'sender' : AuthService.getEmail(),
      'receiver': replyEmail,
      'messageBody': $scope.composeEmail,
      'messageSubj': $scope.subject,
      'reportId': reportId
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

    },
    //2/28
    function(response)
    {
      //for checking
      console.log(response);


    })
    .finally(function()
    {
      $scope.composeEmail = undefined;
    });
  }

  $scope.markAsRead = function(){

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

          for(var counter=0; counter < $scope.reports.length; counter++)
          {
            if($.inArray($scope.reports[counter].report_id, $scope.reportList.report_id) > -1 && $scope.reports[counter].is_read == 0)
            {
              $scope.reports[counter].is_read = 1;
              //$rootScope.newMessageCount -= 1;
            }
          }

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
    //$interval.cancel($rootScope.notifPoll);
    //$interval.cancel($scope.msgPoll);

    var reportDetails =
    {
      'reportList' : $scope.reportList,
      'email': AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/markReport',
      data: reportDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      for(var counter=0; counter < $scope.reports.length; counter++)
      {
        if($.inArray($scope.reports[counter].report_id, $scope.reportList.report_id) > -1 && $scope.reports[counter].is_read == 1)
        {
          $scope.reports[counter].is_read = 0;
          //$rootScope.newMessageCount += 1;
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
      $scope.markMessageList.report_id = [];
      $scope.mainCheckbox = false;
      //$scope.msgPoll = $interval($scope.getMessageList, 3000);
      //$rootScope.notifPoll = $interval($scope.getNotif, 3000);
    });
  }

  $('#viewModal').focus(function()
  {
    $scope.readReport();
  })

  $scope.updateReportStatus = function(report)
  {
    var updateDetails = {
        'email' : report.email,
        'reportId' : report.report_id,
        'status' : parseInt($scope.status),
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

      },
      function(response)
      {
        //for checking
        //console.log(response);


      })
      .finally(function()
      {

      });

  }

}) //closing tag controller


// <-------------------------------------------------------------------------------->


.controller('ManageStudentController', function(config, $scope, $http, $state, AuthService)
{

  $scope.programList = [
    { text: "Humanities and Social Sciences", value: 1 },
    { text: "Accountancy, Business and Management", value: 2},
    { text: "Computer Programming", value: 3 },
    { text: "Animation", value: 4},
    { text: "Fashion Design", value: 5 },
    { text: "Multimedia Arts", value: 6},
  ];

  $scope.courseList = [
    { text: "Software Engineering", value: 1 },
    { text: "Game Development", value: 2},
    { text: "Web Development", value: 3 },
    { text: "Animation", value: 4},
    { text: "Multimedia Arts", value: 5 },
    { text: "Fashion Design", value: 6},
    { text: "Real Estate Management", value: 7 },
    { text: "Business Administration", value: 8}
  ];

  $scope.gradeList = [
    { text: "Grade 11", value: 1 },
    { text: "Grade 12", value: 2}
  ];

  $scope.yearList = [
    { text: "First Year", value: 1 },
    { text: "Second Year", value: 2},
    { text: "Third Year", value: 3},
    { text: "Fourth Year", value: 4}
  ];

  $scope.getStudentList = function(){
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
      $scope.totalItems = $scope.students.length;


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

    $scope.searchBox = undefined;
    $scope.studentList = {};
    $scope.studentList.id = [];
    $scope.mainCheckbox = false;

    //for pagination
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;

    $scope.getStudentList();
  } //scope initScope

  $scope.initScope();


  $scope.deleteStudent = function(student_id)
  {
    BootstrapDialog.confirm({
      title: 'Delete Student',
      message: 'Are you sure you want to delete this student?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      btnCancelLabel: 'Cancel',
      btnOKLabel: 'Delete',
      btnOKClass: 'btn-danger',
      callback: function(result)
      {
        if(result)
        {
          var studentDetails =
          {
            'studentId': student_id
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

            var idIndex = indexOfId($scope.students, student_id);
            //$scope.adminAccounts.splice($scope.adminAccounts.email.indexOf(email),1);
            $scope.students.splice(idIndex,1);
          },
          function(response)
          {
            //for checking
            console.log(response);

            if(response.status == 400)
            {
              if(response.data.errMsg == 'Cannot delete student')
              {
                //empty for now
              }
            }

          })
          .finally(function()
          {
            /*$scope.markMessageList.report_id = [];
            $scope.mainCheckbox = false;*/
          });
        }
      }
    });


    function indexOfId(array, student_id) {
    for (var i=0; i<array.length; i++) {
       if (array[i].student_id==student_id) return i;
    }
    return -1;

    }
  } // $scope.deleteAdmin

  /*$scope.deleteAdminList = function()
  {
    BootstrapDialog.confirm({
      title: 'Delete Administrators',
      message: 'Are you sure you want to delete selected accounts?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      btnCancelLabel: 'Cancel',
      btnOKLabel: 'Delete',
      btnOKClass: 'btn-danger',
      callback: function(result)
      {
        if(result)
        {
          var adminDetails =
          {
            'adminList' : $scope.adminList
            //'email': AuthService.getEmail()
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

            for(var counter=$scope.adminAccounts.length - 1; counter >= 0 ; counter--)
            {
              if($.inArray($scope.adminAccounts[counter].email, $scope.adminList.email) > -1)
              {
                $scope.adminAccounts.splice(counter,1);
              }
            }
            //$rootScope.newMessageCount -= 1;
          },
          function(response)
          {
            //for checking
            console.log(response);

            if(response.status == 400)
            {
              if(response.data.errMsg == 'Cannot delete admin')
              {
                //empty for now
              }
            }

          })
          .finally(function()
          {
            //$scope.markMessageList.report_id = [];
            $scope.mainCheckbox = false;
          });
        }
      }
    });
  }*/

  $scope.showPopup = function(student)
  {

    console.log(student);
    $scope.selectedStudent = student;

    $scope.department = student.department_id;
    $scope.studId = student.student_id;
    $scope.originalId = student.student_id;
    $scope.studLName = student.last_name;
    $scope.studFName = student.first_name;
    $scope.program = student.program_id;
    $scope.level = student.level;

    //$scope.defaultSelected = student.program_id;

    //console.log($scope.selectedStudent);
    //$scope.composeEmail = undefined;
    //$scope.scrollOnTop = false;
    //$scope.showLimit = -4;
  }

  /*
  $scope.controlCheckbox = function ()
  {
    $scope.adminList.email = [];

    if($scope.mainCheckbox)
    {
      for(var counter=0; counter < $scope.adminAccounts.length; counter++)
      {
        $scope.adminList.email.push($scope.adminAccounts[counter].email);
      }
    }
  }

  $scope.updateMainCheckbox = function ()
  {
    if($scope.adminList.email.length == $scope.adminAccounts.length)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
    }
  }

  */

  $scope.updateStudent = function(){
    var studentDetails =
    {
        'email' : AuthService.getEmail(),
        'originalId': $scope.originalId,
        'studentId' : $scope.studId,
        'lastName' : $scope.studLName,
        'firstName' : $scope.studFName,
        'program' : parseInt($scope.program),
        'level' : parseInt($scope.level)

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

    },
    //2/28
    function(response)
    {
      //for checking
      console.log(response);


    })
    .finally(function()
    {
      //$scope.composeEmail = undefined;
    });
  }


})


// <------------------------------------------------------------------>


.controller('ManageFacultyController', function(config, $scope, $http, $state, AuthService)
{

  $scope.getFacultyList = function(){
    var adminDetails =
    {
      'email' : AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/listFaculty',
      data: adminDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.facultyAccounts = JSON.parse(response.data.facultyList);
      $scope.totalItems = $scope.facultyAccounts.length;
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
    $scope.createBtn = "Create Account";
    $scope.disableRegBtn = false;

    $scope.searchBox = undefined;
    $scope.facultyList = {};
    $scope.facultyList.email = [];
    $scope.mainCheckbox = false;

    //for pagination
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;

    $scope.getFacultyList();
  } //scope initScope

  $scope.initScope();

  $scope.showRegFacultyModal = function()
  {
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

          $('#facultyRegModal').modal('hide');
        },
        function(response)
        {
          //for checking
          console.log(response);

          if(response.status == 400)
          {
            if(response.data.errMsg == 'Email exist')
            {
              $scope.regFacultyForm.facultyEmail.$setValidity('emailExist', false);
            }
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
    BootstrapDialog.confirm({
      title: 'Delete Faculty',
      message: 'Are you sure you want to delete this account?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      btnCancelLabel: 'Cancel',
      btnOKLabel: 'Delete',
      btnOKClass: 'btn-danger',
      callback: function(result)
      {
        if(result)
        {
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

            var emailIndex = indexOfId($scope.facultyAccounts, email);
            //$scope.adminAccounts.splice($scope.adminAccounts.email.indexOf(email),1);
            $scope.facultyAccounts.splice(emailIndex,1);
          },
          function(response)
          {
            //for checking
            console.log(response);

            if(response.status == 400)
            {
              if(response.data.errMsg == 'Cannot delete faculty')
              {
                //empty for now
              }
            }

          })
          .finally(function()
          {
            /*$scope.markMessageList.report_id = [];
            $scope.mainCheckbox = false;*/
          });
        }
      }
    });


    function indexOfId(array, email) {
    for (var i=0; i<array.length; i++) {
       if (array[i].email==email) return i;
    }
    return -1;

    }
  } // $scope.deleteAdmin

  $scope.deleteFacultyList = function()
  {
    BootstrapDialog.confirm({
      title: 'Delete Faculty Accounts',
      message: 'Are you sure you want to delete selected accounts?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      btnCancelLabel: 'Cancel',
      btnOKLabel: 'Delete',
      btnOKClass: 'btn-danger',
      callback: function(result)
      {
        if(result)
        {
          var facultyDetails =
          {
            'facultyList' : $scope.facultyList
            //'email': AuthService.getEmail()
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

            for(var counter=$scope.facultyAccounts.length - 1; counter >= 0 ; counter--)
            {
              if($.inArray($scope.facultyAccounts[counter].email, $scope.facultyList.email) > -1)
              {
                $scope.facultyAccounts.splice(counter,1);
              }
            }
            //$rootScope.newMessageCount -= 1;
          },
          function(response)
          {
            //for checking
            console.log(response);

            if(response.status == 400)
            {
              if(response.data.errMsg == 'Cannot delete faculty')
              {
                //empty for now
              }
            }

          })
          .finally(function()
          {
            //$scope.markMessageList.report_id = [];
            $scope.mainCheckbox = false;
          });
        }
      }
    });
  }

  $scope.controlCheckbox = function ()
  {
    $scope.facultyList.email = [];

    if($scope.mainCheckbox)
    {
      for(var counter=0; counter < $scope.facultyAccounts.length; counter++)
      {
        $scope.facultyList.email.push($scope.facultyAccounts[counter].email);
      }
    }
  }

  $scope.updateMainCheckbox = function ()
  {
    if($scope.facultyList.email.length == $scope.facultyAccounts.length)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
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

      for(var counter=0; counter < $scope.SYList.length; counter++)
      {
        $scope.SYList[counter].school_year = $scope.SYList[counter].school_year.split('-').join(' - ');
      }

      if($scope.SYList.length != 0)
      {
        $scope.selectedSY = $scope.SYList[$scope.SYList.length-1].school_year;
      }
      else
      {
        $scope.isEmptySYList = true;
      }
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

      $scope.termLabels = ['First Term','Second Term','Third Term'];

      $scope.programLabels = ['SE','GD','WD'];

      $scope.levelLabels = ['First Year','Second Year','Third Year','Fourth Year'];

      $scope.reasonLabels = ['Late','Mental','Lazy'];

      $scope.statusLabels = ['Uncounseled','In Progress','Counseled'];

      $scope.termData = [[40,50,45]];

      $scope.programData = [[20,30,25]];

      $scope.levelData = [[100,30,25,77]];

      $scope.reasonData = [[50,70,25]];

      $scope.statusData = [[54,30,85]];

      $scope.series = ['Number of reports'];

      $scope.combinedArr = $scope.termData[0].concat($scope.programData[0], $scope.levelData[0], $scope.reasonData[0], $scope.statusData[0]);

      $scope.options =
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
                min: 0, max: Math.ceil((arrayMax($scope.combinedArr) + 10) / 10) * 10, stepSize: 10
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
          text: 'Reports Per',
          padding: 25,
          fontSize: 25,
          fontFamily: 'gotham-book'
        }
      };


      //$scope.SYList = JSON.parse(response.data.SYList);
    },
    function(response)
    {

    })
    .finally(function()
    {

    });
  }

  $scope.initScope = function()
  {
    $scope.currentDate = Date.today().toString('dddd, MMMM d, yyyy');
    $scope.currentDateNum = Date.today().toString('MMddyy');
    $scope.isEmptySYList = false;


    $scope.getSY();
    $scope.getSummaryData();
  } //scope initScope

  $scope.initScope();

  //user defined functions
  function arrayMax(array)
  {
    return array.reduce(function(a, b) {
      return Math.max(a, b);
    });
  }

  function arrayMin(array)
  {
    return array.reduce(function(a, b) {
      return Math.min(a, b);
    });
  }

  function getXOffset(doc, str)
  {
    return strOffset = (doc.internal.pageSize.width / 2) - (doc.getStringUnitWidth(str) * doc.internal.getFontSize() / 6);
  }

  function capitalizeFirstLetter(string)
  {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  //download image function
  $scope.downloadImage = function(event, chartId)
  {
    var elemRef = document.getElementById(event.target.id);

    elemRef.href = document.getElementById(chartId).toDataURL('image/png', 1.0);
    elemRef.download = chartId + '_chart_' + $scope.currentDateNum + '.png';
  }



  //download pdf function
  $scope.downloadPDF = function(chartId)
  {
    html2canvas($("#" + chartId),
    {
      background: "#ffffff",
      onrendered: function(canvas)
      {
        var mainTitle = 'Reports Per ' + capitalizeFirstLetter(chartId);
        var sy = 'S.Y. ' + $scope.selectedSY;
        var myImage = canvas.toDataURL("image/jpeg");

        var doc = new jsPDF('landscape');

        doc.setFontSize(28);
        doc.setFontType('bold');
        doc.text(getXOffset(doc, mainTitle), 25, mainTitle);

        doc.setFontSize(16);
        doc.setFontType('normal');
        doc.text(getXOffset(doc, sy), 35, sy);

        doc.text(getXOffset(doc, $scope.currentDate), 43, $scope.currentDate);

        doc.addImage(myImage, 'JPEG', 50, 55, 200, 110);

        doc.save(chartId + '_chart_' + $scope.currentDateNum + '.pdf');
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
      url: config.apiUrl + '/confirmPassword',
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

      if(response.status == 400)
      {
        if(response.data.errMsg == 'Credentials invalid.')
        {
          alert("hELLO ANFBEjn")
        }
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
  $scope.logout = function()
  {
    AuthService.logout();
  }
})


// <----------------------------------------------------------------------------------------->


.controller('ManageAdminController', function(config, $scope, $http, $state, AuthService)
{

  $scope.getAdminList = function(){
    var superAdminDetails =
    {
      'email' : AuthService.getEmail()
    }

    $http({
      method: 'POST',
      url: config.apiUrl + '/listAdmin',
      data: superAdminDetails,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(function(response)
    {
      //for checking
      console.log(response);

      $scope.adminAccounts = JSON.parse(response.data.adminList);
      $scope.totalItems = $scope.adminAccounts.length;

      for(var counter=0; counter < $scope.adminAccounts.length; counter++)
      {
        //if contact is null
        if($scope.adminAccounts[counter].contact_number == null)
        {
          $scope.adminAccounts[counter].contact_number = "N/A";
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

  }

  $scope.initScope = function()
  {
    $scope.createBtn = "Create Account";
    $scope.disableRegBtn = false;

    $scope.searchBox = undefined;
    //$scope.checkBoxSelected = false;
    $scope.adminList = {};
    $scope.adminList.email = [];
    $scope.mainCheckbox = false;

    //for pagination
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;

    $scope.getAdminList();
  } //scope initScope

  $scope.initScope();

  $scope.showRegAdminModal = function()
  {
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

          $('#adminRegModal').modal('hide');
        },
        function(response)
        {
          //for checking
          console.log(response);

          if(response.status == 400)
          {
            if(response.data.errMsg == 'Email exist')
            {
              $scope.regAdminForm.adminEmail.$setValidity('emailExist', false);
            }
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
    BootstrapDialog.confirm({
      title: 'Delete Administrator',
      message: 'Are you sure you want to delete this administrator?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      btnCancelLabel: 'Cancel',
      btnOKLabel: 'Delete',
      btnOKClass: 'btn-danger',
      callback: function(result)
      {
        if(result)
        {
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

            var emailIndex = indexOfId($scope.adminAccounts, email);
            //$scope.adminAccounts.splice($scope.adminAccounts.email.indexOf(email),1);
            $scope.adminAccounts.splice(emailIndex,1);
          },
          function(response)
          {
            //for checking
            console.log(response);

            if(response.status == 400)
            {
              if(response.data.errMsg == 'Cannot delete admin')
              {
                //empty for now
              }
            }

          })
          .finally(function()
          {
            /*$scope.markMessageList.report_id = [];
            $scope.mainCheckbox = false;*/
          });
        }
      }
    });


    function indexOfId(array, email) {
    for (var i=0; i<array.length; i++) {
       if (array[i].email==email) return i;
    }
    return -1;

    }
  } // $scope.deleteAdmin

  $scope.deleteAdminList = function()
  {
    BootstrapDialog.confirm({
      title: 'Delete Administrators',
      message: 'Are you sure you want to delete selected accounts?',
      type: BootstrapDialog.TYPE_PRIMARY,
      closable: false,
      btnCancelLabel: 'Cancel',
      btnOKLabel: 'Delete',
      btnOKClass: 'btn-danger',
      callback: function(result)
      {
        if(result)
        {
          var adminDetails =
          {
            'adminList' : $scope.adminList
            //'email': AuthService.getEmail()
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

            for(var counter=$scope.adminAccounts.length - 1; counter >= 0 ; counter--)
            {
              if($.inArray($scope.adminAccounts[counter].email, $scope.adminList.email) > -1)
              {
                $scope.adminAccounts.splice(counter,1);
              }
            }
            //$rootScope.newMessageCount -= 1;
          },
          function(response)
          {
            //for checking
            console.log(response);

            if(response.status == 400)
            {
              if(response.data.errMsg == 'Cannot delete admin')
              {
                //empty for now
              }
            }

          })
          .finally(function()
          {
            //$scope.markMessageList.report_id = [];
            $scope.mainCheckbox = false;
          });
        }
      }
    });
  }

  $scope.controlCheckbox = function ()
  {
    $scope.adminList.email = [];

    if($scope.mainCheckbox)
    {
      for(var counter=0; counter < $scope.adminAccounts.length; counter++)
      {
        $scope.adminList.email.push($scope.adminAccounts[counter].email);
      }
    }
  }

  $scope.updateMainCheckbox = function ()
  {
    if($scope.adminList.email.length == $scope.adminAccounts.length)
    {
      $scope.mainCheckbox = true;
    }
    else
    {
      $scope.mainCheckbox = false;
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

})


// <------------------------------------------------------------------>


//template
.controller('', function($scope, $http, $state)
{


  $scope.functionName = function()
  {

  }


})
