# JamTrip

A graphical user interface (GUI) front end for JackTrip and JACK, specifically for real-time internet music collaboration (AKA "jamming").

The goal is to be as simple to use as possible, since many musicians have had a hard time setting JackTrip up. By contrast, JamTrip does not require manually launching multiple programs, configuring them, connecting audio routes, nor using the command line. It handles all of that for you in one single app.

Wanna leave me a tip? Well, shucks! Support me here:

<div>
<a href="https://www.buymeacoffee.com/vicwomg" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
  </div>

Check out [CCRMA](https://ccrma.stanford.edu/software/jacktrip/) for more information about the amazing JackTrip project that makes this possible.

<div>
<img src="https://user-images.githubusercontent.com/4107190/100566853-f2c07f00-327b-11eb-9e59-a3c42d260e89.jpg" align="left" width="320" >
<img src="https://user-images.githubusercontent.com/4107190/100566861-f5bb6f80-327b-11eb-81f4-56156830659f.jpg" width="320" >
</div>

## Requirements

- JamTrip is only working on Mac OSX, Windows 10, and raspberry pi (see instructions the end of Readme). You can probably get it running on linux without too much trouble with some version of the rpi instructions
- A microphone and headphones. Ideally these are running through a professional audio interface for lower latency, however a built-in laptop microphone works fine.
- You will need an ethernet cable connection to your router. WiFi drops out too much to work right, though you can certainly try it with a high buffer side as proof-of-concept. If you're on a laptop with no ethernet port, you can add one using a [USB to Ethernet adapter (\$12.99)](https://www.amazon.com/TP-Link-Foldable-Gigabit-Ethernet-Compatible/dp/B00YUU3KC6/) and an [ethernet cable](https://www.amazon.com/Ethernet-Cable-Meters-Network-Internet/dp/B00GBBSRKW/). Connect this directly to a free ethernet port on your wifi router.
- For best results, you're within 200 miles of the other folks you're jamming with, otherwise you start to run into latency limitations from the laws of physics.

## Installation

### Install JACK and other packages

JACK is software for routing your audio channels to various destinations. In this case, it is used to send your audio inputs to your headphones and over the internet (using JackTrip).

#### OSX

- The version of JACK that is available on the jackaudio.org web site does not work with the most recent versions of OS X. Download a beta version of JACK that works with El Capitan and later [from here](https://ccrma.stanford.edu/software/jacktrip/osx/JackOSX.0.92_b3.pkg)
- Double click on the .pkg file to install
  - You may see a security warning pop up window, if so press OK to dismiss it (WARNING: if you don't DISMISS the popup, the below "open anyway" button wont show)
  - Open Spotlight Search (CMD + space, or click the upper right magnifying glass icon), type "Security & Privacy" and launch. (Or System Preferences > Security & Privacy)
  - Click the "General" button and click "Open Anyway" towards the bottom, where it lists the blocked package.
  - Then click "Open" in the next security confirmation window to complete the installation.
- It will want you to restart the machine, go ahead and do that and come back to these instructions.

#### Windows

- Install JACK from here: https://github.com/jackaudio/jackaudio.github.com/releases/download/1.9.11/Jack_v1.9.11_64_setup.exe (do NOT install the version from jackaudio.org, it is currently incompatible)
- Install ASIO 4 All from here: http://www.asio4all.org

### Install JamTrip

- Download / install the latest JamTrip from: https://github.com/vicwomg/jamtrip/releases/latest (click the "assets" dropdown to the get the .dmg or .exe file)
- Open the installer or disk image and install as you normally would:
  - **Mac**: by dragging the app into Applications.
  - **Windows**: running the installer
- Double click it to launch the app
  - **Mac**: you will have to do that whole "security warning" song and dance again to launch: press "ok" to dismiss the warning, then click "open anyway" in System Preferences > Security & Privacy
  - **Older macs**: Saw this on El Capitan: you need to additionally "Allow apps downloaded from: Everywhere" under "Security & Privacy", otherwise it wont get past an app verification loop
  - **Windows**: Installation puts a shortcut on the desktop.

### Configure your hardware and sound settings

- Plug in any audio interfaces or microphones. You may also use the built-in microphone on your laptop
- Plug in headphones (running JamTrip over speakers is not recommended, due to feedback)
- Confirm that your OS-level audio settings are correct:
  - **Mac**: Under "System Preferences > Sound", click the "Input" tab and make sure the proper input device is selected, do the same for the "Output" tab
  - **Windows**: open Windows 10's "Settings > Sound Settings" section, and confirm that the Ouput and and Input devices are set to the proper hardware.

## Usage

### Client mode

To connect to a JackTrip server, enter the "Connection code" you get from the person hosting the server and press "Connect".

- **Mac**: You may get a quick popup about enabling your microphone. Confirm that alert.
- **Windows**: You will get a firewall warning, confirm it to allow the connections that it's requesting.

As a test, you can use the sample code listed under the "Example" field to do a quick connecttion to Stanford's test servers: `jackloop256.stanford.edu_48000_256_h_b16_q4_r1`. After connecting, you should hear your microphone being monitored through your headphones and a periodic clapping sound. If so, you should technically be able to connect to any hosted JackTrip server.

Hit disconnect to disconnect from the server.

### Server mode

To host a JackTrip server, click the "Host a server" tab in the app, configure your audio (the defaults seem optimal in my testing) and click "Start Server". Then send the listed "connection code" to the other party and have them follow the instructions in the "Client mode" section.

Once you're both connected, you should see the "connected!" indicator and you should both be able to hear each other!

Note: For server hosting to work, you need to have TCP/UDP port 4464 open and if using hub mode, additionally TCP/UDP ports 61000-61020 (depending on how many concurrent connections you want to support. Regular servers are one-on-one connections. Hub mode allows 3 or more people. For info on how to forward ports, [this article](https://www.howtogeek.com/66214/how-to-forward-ports-on-your-router/) is pretty good.

## Building JamTrip

This is only necessary if you want to contribute to this project:

### OSX, Linux, and Windows

Requires node js: https://nodejs.org/en/

- Install yarn: https://classic.yarnpkg.com/en/docs/install/
- Clone this project and cd into its directory.
  Then run:

```
yarn
yarn package
```

This builds the current platform executables into the ./release directory.

### Raspberry Pi

Note: in order to build for raspberry pi, there are extra steps:

Install node using these instructions (don't just apt-get it!)
https://linuxize.com/post/how-to-install-node-js-on-raspberry-pi/

Install these packages (the ffi version matters!):

```
sudo npm install --global yarn
sudo apt install ruby ruby-dev libffi-dev rpm
sudo gem install ffi -v 1.9.21
sudo gem install fpm
```

```
yarn
yarn package-pi    # for a unpacked dir with the executable file
yarn package-pi-deb    # for a deb package file
yarn package-pi-rpm    # for a rpm package file
```

## Details

In order to simplify setup, JamTrip makes the following assumptions:

- You're on a reasonably new computer with microphone or audio interface
- You're using the default CoreAudio sound system on your Mac, or ASIO 4 All on Windows
- Your desired sound input/output is selected from the OS's "Settings > Sound > Input/Output"
- You're sending only 2 channel of audio at the most, probably a microphone only, or perhaps an additional instrument in channel 2.
- Audio mix is mono

More exotic setups such as wanting to send multiple input channels and stereo mixes and other kinds of routing would probably be better suited for using JACK and JackTrip directly for now, but if there is enough interest can be added as new configuration options later.

Built in Electron + React
