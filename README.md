# JamTrip

A graphical front-end for JackTrip and JACK that simplifies connecting two or more parties for realtime music collaboration over the internet. The goal is to simplify the process as much as possible. Many musicians have a hard time with the technical aspects of configuring JACK and JackTrip, and launching them from the command line.

<div>
<a href="url"><img src="https://user-images.githubusercontent.com/4107190/100566853-f2c07f00-327b-11eb-9e59-a3c42d260e89.jpg" align="left" width="320" ></a>
<a href="url"><img src="https://user-images.githubusercontent.com/4107190/100566861-f5bb6f80-327b-11eb-81f4-56156830659f.jpg" width="320" ></a>
</div>

## Details

In order to simplify things, JamTrip makes the following assumptions:

- You're on a reasonably new computer with microphone or audio interface
- You're using the default CoreAudio sound system on your Mac
- Your desired sound input/output is selected from "System Preferences > Sound > Input/Output"
- You're sending only one channel of audio
- Audio mix is mono

More exotic setups such as wanting to send multiple input channels and stereo mixes and other kinds of routing would probably be better suited for using JACK and JackTrip directly for now, but can possibly be added as configuration options later.

PC support shouldn't be far behind once the kinks are ironed out.

Built in Electron + React

## Installation

### Install JACK

JACK is software for taking your audio channels and routing them to various destinations. It is necessary to point your audio inputs to your headphones (for monitoring) and to the internet through JackTrip.

- The version that is available on the jackaudio.org web site does not work with recent versions of OS X. Download a beta version that works with El Capitan and later here: https://ccrma.stanford.edu/software/jacktrip/osx/JackOSX.0.92_b3.pkg
- Double click on the .pkg file to install
- You may see a security warning pop up window, if so press OK
- Press the Command and Spacebar keys (or click the magnifying glass icon in the upper right of OSX) to open Spotlight Search, type "Security & Privacy" and click Open Anyway towards the bottom, where it lists the blocked package.
- Then click "Open" in the security confirmation window

### Install JackTrip

JackTrip is the network protocol that allows audio signals from JACK to be sent across the intenet.

- If you are running macOS High Sierra, Mojave or Catalina, download the JackTrip 1.2.1 installer package: https://ccrma.stanford.edu/software/jacktrip/osx/jacktrip-macos-installer-x64-1.2.1.pkg
  On older OS X releases, download the JackTrip 1.1 installer: https://ccrma.stanford.edu/software/jacktrip/osx/JackTrip.pkg (if you don't know which version you're on, click the apple icon in the upper left > About this mac)
- If you get the same security warnings, follow the same instructions above

### Install JamTrip

- Download / install the latest JamTrip from: https://github.com/vicwomg/jamtrip/releases
- Launch the app, you might have to do that whole security warning song and dance again.

### Configure your hardware and sound settings

- Plug in any audio interfaces or microphones. You may also use the built-in microphone on your laptop
- For mac: under System Preferences > Sound, click the Input tab and make sure the proper input device is selected, do the same for the Output tab (you probably want audio going to connected headphones, to avoid feedback)

## Usage

### Client mode

To connect to a JackTrip server, enter the "connection code" you get from the person hosting the server. You can use the sample code listed under the "Example" field to connect to Stanford's test servers. You should hear your microphone being monitored through your headphones and a periodic clapping sound. If so, you should theoretically be able to connect to any hosted JackTrip server.

### Server mode

To host a JackTrip server, click the "Host a server" tab in the app, configure your audio settings and click "Start Server". Then send the listed "connection code" to the other party and have them follow the instructions in the "Client mode" section.

For this to work, you need to have UDP port 4464 open and if using hub mode, additionally 61000, 61001 ... 61XXX. 

For info on how to forward ports, this article is pretty good: https://www.howtogeek.com/66214/how-to-forward-ports-on-your-router/

## Building JamTrip

Only necessary if you want to contribute to this project:

- Install yarn: https://classic.yarnpkg.com/en/docs/install/
- Clone this project and cd into its directory.
Then run:

```
yarn
yarn package
```

This builds the executables into the ./release directory.
