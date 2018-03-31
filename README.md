# mget

A parallel downloader using curl. It splits a large file into multiple of segments and download
them concurrently using HTTP Range header (multiple "get"). This likely increase download speed
particularly when the TCP connections is not able to saturate available bandwidth in the path
due to some reasons which inclueds:

* Long-fat (delay x bandwidth) pipe with limited send/recv buffers.
* Small socket send buffer at server.
* Intentional rate limitting at server.
* Congestion window shrinkage due to a large packet loss in the path.


## Installation
```shell
npm install -g mget
```

## Usage
```
  Usage: mget [options] <url>

  Options:

    -c, --concurrency <num>  Concurrency. (default: 0 - auto)
    -o, --output <pathname>  Output file path.)
    -h, --help               output usage information
```

### Example

* Using 4 concurrent HTTP GET transactions.
* Save the file as the basename of the URL. (same as curl's -O option)
```
mget -c 4 http://ipv4.download.thinkbroadband.com/5MB.zip
```

### Results
Here's an example results of the performance increase.

Concurrency: 1
```
$ time mget -c 1 http://ipv4.download.thinkbroadband.com/5MB.zip
Progress: 100%

real	0m10.607s
user	0m0.242s
sys	0m0.122s
```

Concurrency: 4
```
$ time mget -c 4 http://ipv4.download.thinkbroadband.com/5MB.zip
Progress: 100% 100% 100% 100%

real	0m6.848s
user	0m0.272s
sys	0m0.140s
```

Concurrency: 8
```
$ time mget -c 8 http://ipv4.download.thinkbroadband.com/5MB.zip
Progress: 100% 100% 100% 100% 100% 100% 100% 100%

real	0m5.668s
user	0m0.309s
sys	0m0.170s
```


## API
You can use this module inside your application.

> TODO: more details

Please see ./bin/cli.js for your reference.

## To do
* Add retries logic.
* API reference.

