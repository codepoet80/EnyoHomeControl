<?php
header('Content-Type: application/json');

$queryURL = $_SERVER['QUERY_STRING'];
$lines_array=file($queryURL);
$lines_string=implode('',$lines_array);
echo $lines_string;
?>