<?php

/**
 * AJAX Cross Domain (PHP) Proxy 0.8
 * Copyright (C) 2016 Iacovos Constantinou (https://github.com/softius)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Enables or disables filtering for cross domain requests.
 * Recommended value: true
 */
define('CSAJAX_FILTERS', true);

/**
 * Enables or disables Expect: 100-continue header. Some webservers don't 
 * handle this header correctly.
 * Recommended value: false
 */
define('CSAJAX_SUPPRESS_EXPECT', false);

/**
 * Set debugging to true to receive additional messages - really helpful on development
 */
define('CSAJAX_DEBUG', false);

/**
 * A set of valid cross domain requests
 */
$valid_requests = array(
    '/api/auth/login',
    '/api/accessories'
);

/**
 * Set extra multiple options for cURL
 * Could be used to define CURLOPT_SSL_VERIFYPEER & CURLOPT_SSL_VERIFYHOST for HTTPS
 * Also to overwrite any other options without changing the code
 * See http://php.net/manual/en/function.curl-setopt-array.php
 */
$curl_options = array(
    // CURLOPT_SSL_VERIFYPEER => false,
    // CURLOPT_SSL_VERIFYHOST => 2,
);

/* * * STOP EDITING HERE UNLESS YOU KNOW WHAT YOU ARE DOING * * */

// identify request headers
$request_headers = array( );
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0  ||  strpos($key, 'CONTENT_') === 0) {
        $headername = str_replace('_', ' ', str_replace('HTTP_', '', $key));
        $headername = str_replace(' ', '-', ucwords(strtolower($headername)));
        if (!in_array($headername, array( 'Host', 'X-Proxy-Url' ))) {
            $request_headers[] = "$headername: $value";
        }
    }
}
if (null !== getBearerToken())
  array_unshift($request_headers, "Authorization: Bearer " . getBearerToken());

// identify request method, url and params
$request_method = $_SERVER['REQUEST_METHOD'];
if ('GET' == $request_method) {
    $request_params = $_GET;
} elseif ('POST' == $request_method) {
    $request_params = $_POST;
    if (empty($request_params)) {
        $data = file_get_contents('php://input');
        if (!empty($data)) {
            $request_params = $data;
        }
    }
} elseif ('PUT' == $request_method || 'DELETE' == $request_method) {
    $request_params = file_get_contents('php://input');
} else {
    $request_params = null;
}

// Get URL from `csurl` in GET or POST data, before falling back to X-Proxy-URL header.
if (isset($_REQUEST['csurl'])) {
    $request_url = urldecode($_REQUEST['csurl']);
} elseif (isset($_SERVER['HTTP_X_PROXY_URL'])) {
    $request_url = urldecode($_SERVER['HTTP_X_PROXY_URL']);
} else {
    header($_SERVER['SERVER_PROTOCOL'] . ' 400 Bad Request');
    header('Status: 400 Bad Request');
    $_SERVER['REDIRECT_STATUS'] = 400;
    exit;
}

$p_request_url = parse_url($request_url);

// csurl may exist in GET request methods
if (is_array($request_params) && array_key_exists('csurl', $request_params)) {
    unset($request_params['csurl']);
}

// ignore requests for proxy :)
if (preg_match('!' . $_SERVER['SCRIPT_NAME'] . '!', $request_url) || empty($request_url) || count($p_request_url) == 1) {
    csajax_debug_message('Invalid request - make sure that csurl variable is not empty');
    exit;
}

// check against valid requests
if (CSAJAX_FILTERS) {
    $parsed = $p_request_url;
    $check_url = isset($parsed['path']) ? $parsed['path'] : '';
    $request_ok = false;
    foreach($valid_requests as $valid_request) {
      if(strpos($check_url, $valid_request) !== false){
        $request_ok = true;
        break;
      }
    }
    if (!$request_ok) {
      csajax_debug_message('Invalid request - ' . $check_url . ' does not included in valid requests');
      exit;
    }
}

// append query string for GET requests
if ($request_method == 'GET' && count($request_params) > 0 && (!array_key_exists('query', $p_request_url) || empty($p_request_url['query']))) {
    $request_url .= '?' . http_build_query($request_params);
}

// let the request begin
$ch = curl_init($request_url);

// Suppress Expect header
if (CSAJAX_SUPPRESS_EXPECT) {
    array_push($request_headers, 'Expect:'); 
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $request_headers);   // (re-)send headers
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);     // return response
curl_setopt($ch, CURLOPT_HEADER, true);       // enabled response headers
// add data for POST, PUT or DELETE requests
if ('POST' == $request_method) {
    $post_data = is_array($request_params) ? http_build_query($request_params) : $request_params;
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS,  $post_data);
} elseif ('PUT' == $request_method || 'DELETE' == $request_method) {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $request_method);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $request_params);
}

// Set multiple options for curl according to configuration
if (is_array($curl_options) && 0 <= count($curl_options)) {
    curl_setopt_array($ch, $curl_options);
}

// retrieve response (headers and content)
$response = curl_exec($ch);
curl_close($ch);

// split response to header and content
list($response_headers, $response_content) = preg_split('/(\r\n){2}/', $response, 2);

// (re-)send the headers
$response_headers = preg_split('/(\r\n){1}/', $response_headers);
foreach ($response_headers as $key => $response_header) {
    // Rewrite the `Location` header, so clients will also use the proxy for redirects.
    if (preg_match('/^Location:/', $response_header)) {
        list($header, $value) = preg_split('/: /', $response_header, 2);
        $response_header = 'Location: ' . $_SERVER['REQUEST_URI'] . '?csurl=' . $value;
    }
    if (!preg_match('/^(Transfer-Encoding):/', $response_header)) {
        header($response_header, false);
    }
}

// finally, output the content
print($response_content);

function csajax_debug_message($message)
{
    if (true == CSAJAX_DEBUG) {
        print $message . PHP_EOL;
    } else {
      error_log("HomeControl PHP CORS Proxy: " . $message);
    }
}

/*Get header Authorization
    http://stackoverflow.com/questions/1739706/ddg#1739717
*/
function getAuthorizationHeader(){
  $headers = null;
  if (isset($_SERVER['Authorization'])) {
      $headers = trim($_SERVER["Authorization"]);
  }
  else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
      $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
  } elseif (function_exists('apache_request_headers')) {
      $requestHeaders = apache_request_headers();
      // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
      $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
      //print_r($requestHeaders);
      if (isset($requestHeaders['Authorization'])) {
          $headers = trim($requestHeaders['Authorization']);
      }
  }
  return $headers;
}

function getBearerToken() {
  $headers = getAuthorizationHeader();
  // HEADER: Get the access token from the header
  if (!empty($headers)) {
      if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
          return $matches[1];
      }
  }
  return null;
}
?>