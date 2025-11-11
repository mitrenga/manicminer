<?php

class DataCommand {
   
  var $files = [
    'global', 'menu',
    'cave00', 'cave01', 'cave02', 'cave03', 'cave04', 'cave05', 'cave06', 'cave07', 'cave08', 'cave09',
    'cave10', 'cave11', 'cave12', 'cave13', 'cave14', 'cave15', 'cave16', 'cave17', 'cave18', 'cave19'
  ];

  public function execute($postData) {
    $result = [];
    foreach ($this->files as $file) {
  	  $dataJSON = file_get_contents('data/'.$file.'.json');
      try {
        $result[$file] = json_decode($dataJSON);
      }
      catch (\JsonException $exception) {
        $result[$file] = ['error' => ['message' => $exception->getMessage()]];
      } 
    }

    $mysqli = new mysqli($GLOBALS['dbHostname'], $GLOBALS['dbUser'], $GLOBALS['dbPassword'], $GLOBALS['dbName']);
    $data = $mysqli->query('SELECT `score` FROM `hallOfFame` ORDER BY `score` DESC LIMIT 1');
    $mysqli->close();
    $result['hiScore'] = 0;
    if ($row = $data->fetch_object()) {
      $result['hiScore'] = $row->score;
    }

    return $result;
  } // execute

} // class DataCommand

