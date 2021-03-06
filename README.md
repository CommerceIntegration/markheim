# Markheim

The killer static site generator for everyone.

http://en.wikipedia.org/wiki/Markheim

## Configuration Files

The first configuration file that's loaded contains Markheim's own settings, and is located at `config/default.yml`. This tells us which SSG layout we are using. For example:

```yaml
ssg: jekyll
```

Then we load Markheim's own default values for the corresponding SSG. This file will also be in the `config` directory.

Then we load the SSG's own default values. These settings could have been placed directly into the file loaded in the previous step but by loading the SSG defaults in two steps we're able to make use of any default files that an SSG might provide. In the case of Jekyll the `defaults/jekyll.yaml` file is taken directly from the Jekyll project.

Finally, we can load the settings for a particular site. The location of these settings will usually come from the Markheim defaults for the SSG (`config/jekyll.yaml`, for example) rather than the SSG's own defaults (`defaults/jekyll.yaml`) since these kinds of settings will usually be hard-coded.

## Build a Site

```shell
$ markheim build
# => The current folder will be generated into ./_site
```

Sample run:

```shell
$ markheim build
[18:52:58] Configuration file: /Users/markbirbeck/Documents/workspace/_norepo/my-awesome-site/_config.yml
[18:52:58]             Source: /Users/markbirbeck/Documents/workspace/_norepo/my-awesome-site
[18:52:58]        Destination: /Users/markbirbeck/Documents/workspace/_norepo/my-awesome-site/_site
[18:52:59]       Preprocessing...
[18:53:03]       Generating...
```

## Build and Serve a Site Locally

```shell
$ markheim serve
# => The current folder will be generated into ./_site and then served with BrowserSync
```

Sample run:

```shell
$ markheim serve
[18:53:23] Configuration file: /Users/markbirbeck/Documents/workspace/_norepo/my-awesome-site/_config.yml
[18:53:23]             Source: /Users/markbirbeck/Documents/workspace/_norepo/my-awesome-site
[18:53:23]        Destination: /Users/markbirbeck/Documents/workspace/_norepo/my-awesome-site/_site
[18:53:23]       Preprocessing...
[18:53:27]       Generating...
[BS] Access URLs:
 -------------------------------------
       Local: http://localhost:4000
    External: http://192.168.1.13:4000
 -------------------------------------
          UI: http://localhost:4001
 UI External: http://192.168.1.13:4001
 -------------------------------------
[BS] Serving files from: /Users/markbirbeck/Documents/workspace/_norepo/my-awesome-site/_site
[BS] Watching files...
```

### Destination folders are cleaned on site builds

The contents of *destination* are automatically cleaned, by default, when the site is built. Files or folders that are not created by your site will be removed. Files and folders you wish to retain in *destination* may be specified within the *keep_files* configuration directive.

Do not use an important location for *destination*; instead, use it as a staging area and copy files from there to your web server.