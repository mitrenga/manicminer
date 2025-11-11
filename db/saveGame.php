<?php

class DataCommand {
   
   public function execute($postData) {
      $data = json_decode($postData);
      $mysqli = new mysqli($GLOBALS['dbHostname'], $GLOBALS['dbUser'], $GLOBALS['dbPassword'], $GLOBALS['dbName']);
      $data = $mysqli->query(sprintf ('INSERT INTO `hallOfFame` (`name`, `score`) VALUES (\'%s\', %d)', $data->name, $data->score));

      $data = $mysqli->query('SELECT `score` FROM `hallOfFame` ORDER BY `score` DESC LIMIT 1');
      $mysqli->close();
      $result = [];
      $result['hiScore'] = 0;
      if ($row = $data->fetch_object()) {
         $result['hiScore'] = $row->score;
      }
      return $result;
   } // execute

} // class DataCommand

