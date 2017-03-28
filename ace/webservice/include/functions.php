<?php


    //temporary function
    function sendResponse($response)
    {
        header('Content-Type: application/json');
        header("Access-Control-Allow-Origin: *");
        echo json_encode($response);
    }


    //temporary function
    function sendStatusCode($statusCode)
    {
        header('Content-Type: application/json');
        header("Access-Control-Allow-Origin: *");
        http_response_code($statusCode);
    }


    function setResponse($response, $statusCode, $responseBody)
    {
        header('Content-Type: application/json');
        header("Access-Control-Allow-Origin: *");

        return $response->withStatus($statusCode)->withJson($responseBody);
    }


    function setSuccessResponse($response, $statusCode)
    {
        header('Content-Type: application/json');
        header("Access-Control-Allow-Origin: *");

        return $response->withStatus($statusCode);
    }


    function sendEmail($recipient, $subject, $body)
	{
		$mail = new PHPMailer;

        $mail->isSMTP();                                      // Set mailer to use SMTP
        $mail->SMTPAuth = true;                               // Enable SMTP authentication
        $mail->Host = $_ENV['GMAIL']->GMAIL_HOST;
        $mail->Username = $_ENV['GMAIL']->GMAIL_EMAIL;                        // SMTP username
        $mail->Password = $_ENV['GMAIL']->GMAIL_PWORD;                        // SMTP password
        $mail->SMTPSecure = 'tls';                            // Enable TLS encryption, `ssl` also accepted
        $mail->Port = 587;                                    // TCP port to connect to

        if(count($recipient) == 1){
          $mail->AddAddress($recipient);
        } else {
          for($counter=0; $counter < count($recipient); $counter++){
            $email = implode(',', $recipient[$counter]);
            $mail->AddAddress($email);
          }
        }



        //$mail->AddAddress($recipient);                        // Name is optional

        //$mail->addReplyTo('ace@iacademy.com', 'ACE');
        $mail->SetFrom($_ENV['GMAIL']->GMAIL_EMAIL, $_ENV['GMAIL']->GMAIL_SENDER_NAME);
        //$mail->addAttachment('/var/tmp/file.tar.gz');       // Add attachments
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->IsHTML(true);

        return $mail->Send();
	}


    function randStrGen()
    {
        $len = 5;
        $result = "";
        $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        $charArray = str_split($chars);

        for($i = 0; $i < $len; $i++)
        {
            $randItem = array_rand($charArray);
            $result .= "".$charArray[$randItem];
        }

        return $result;
    }


    function getTimestamp()
    {
        $date = new DateTime();
        $date->setTimezone(new DateTimeZone('Asia/Manila'));

        return $date;
    }

    function databaseBackup(){

      $dbName = $_ENV['DB']->DB_NAME;
      $dbHost = $_ENV['DB']->DB_HOST;
      $dbUsername = $_ENV['DB']->DB_USERNAME;
      $dbPassword = $_ENV['DB']->DB_PASSWORD;
      $timestamp = getTimeStamp()->format('y-m-d_H-i');
      $backupFile = $dbName . "(" .$timestamp . ").sql";

      //$command = "mysqldump --opt -h $dbhost -u $dbuser -p $dbpass $dbname | gzip > $backupFile";
      //$command = "C:/xampp/mysql/bin/mysqldump --opt -h $dbHost -u $dbUsername -p $dbPassword $dbName > $backupFile";
      //$command = "/xampp/mysql/bin/ mysqldump --opt -h $dbHost -u $dbUsername -p $dbPassword $dbName > $backupFile";
      $command = "/xampp/mysql/bin/mysqldump --opt -h $dbHost -u $dbUsername $dbName > $backupFile";


      //-r "/path/to/www/directory/sync/products.sql"

      //C:/xampp/mysql/bin/mysqldump --opt -h localhost -u root -pPASSWORD ace > C:/text.sql
      //-u root -p databasename

      ///xampp/mysql/bin/mysqldump --opt -h localhost -u root ace > "C:\dbbkup.%DATE:/=%.bak"

      $var = system($command, $ret_val);

      return $var;

    }
?>
