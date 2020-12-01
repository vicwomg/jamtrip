# JamTrip

A graphical user interface (GUI) front end for JackTrip and JACK, specifically for real-time internet music collaboration (AKA "jamming"). 

The goal is to be as simple to use as possible, since many musicians have had a hard time setting JackTrip up. By contrast, JamTrip does not require manually launching multiple programs, configuring them, connecting audio routes, or using the command line. It handles all of that for you in one single app. 

Check out [CCRMA](https://ccrma.stanford.edu/software/jacktrip/) for more information about the amazing JackTrip project that makes this possible.

<div>
<img src="https://user-images.githubusercontent.com/4107190/100566853-f2c07f00-327b-11eb-9e59-a3c42d260e89.jpg" align="left" width="320" >
<img src="https://user-images.githubusercontent.com/4107190/100566861-f5bb6f80-327b-11eb-81f4-56156830659f.jpg" width="320" >
</div>


## Installation

### Install JACK

JACK is software for routing your audio channels to various destinations. In this case, it is used to send your audio inputs to your headphones and over the internet (with JackTrip).

- The version that is available on the jackaudio.org web site does not work with recent versions of OS X. Download a beta version that works with El Capitan and later [here](https://ccrma.stanford.edu/software/jacktrip/osx/JackOSX.0.92_b3.pkg)
- Double click on the .pkg file to install
- You may see a security warning pop up window, if so press OK to dismiss it
- Open Spotlight Search (CMD + space, or click the upper right magnifying glass icon), type "Security & Privacy" and launch. (Or System Preferences > Security & Privacy)
- Click the "General" button and click "Open Anyway" towards the bottom, where it lists the blocked package.
- Then click "Open" in the next security confirmation window to complete the installation.

### Install JackTrip

JackTrip is a program that allows high-quality audio signals from JACK to be sent across the intenet with low-latency.

- If you are running macOS High Sierra, Mojave or Catalina, download the JackTrip 1.2.1 installer package [here]( https://ccrma.stanford.edu/software/jacktrip/osx/jacktrip-macos-installer-x64-1.2.1.pkg). On older OS X releases, download the JackTrip 1.1 installer [here](https://ccrma.stanford.edu/software/jacktrip/osx/JackTrip.pkg) (if you don't know which version you're on, click the apple icon in the upper left > About this mac)
- You'll get the same security warnings, follow the same instructions above.

### Install JamTrip

- Download / install the latest JamTrip from: https://github.com/vicwomg/jamtrip/releases (click the "assets" dropdown to the get the .dmg file)
- Click the dmg file to open an image of the executable app, and drag it to your Applications folder or Desktop
- Double click it to launch the app, you might have to do that whole security warning song and dance again.

### Configure your hardware and sound settings

- Plug in any audio interfaces or microphones. You may also use the built-in microphone on your laptop
- Under "System Preferences > Sound", click the "Input" tab and make sure the proper input device is selected, do the same for the "Output" tab (you probably want audio going to connected headphones, to avoid feedback)

## Usage

### Client mode

To connect to a JackTrip server, enter the "Connection code" you get from the person hosting the server and press "Connect". You may get a quick popup about enabling your microphone. Confirm that alert.

As a test, you can use the sample code listed under the "Example" field to do a quick connecttion to Stanford's test servers: `jackloop128.stanford.edu_48000_128_h`. After connecting, you should hear your microphone being monitored through your headphones and a periodic clapping sound. If so, you should technically be able to connect to any hosted JackTrip server.

Hit disconnect to disconnect from the server.

### Server mode

To host a JackTrip server, click the "Host a server" tab in the app, configure your audio (the defaults seem optimal in my testing) and click "Start Server". Then send the listed "connection code" to the other party and have them follow the instructions in the "Client mode" section.

Once you're both connected, you should see the "connected!" indicator and you should both be able to hear each other!

Note: For server hosting to work, you need to have UDP port 4464 open and if using hub mode, additionally ports 61000, 61001 ... 61XXX (depending on how many connections you want to support). Regular servers are one-on-one connections. Hub mode allows 3 or more people to join. For info on how to forward ports, this article is pretty good: https://www.howtogeek.com/66214/how-to-forward-ports-on-your-router/

## Building JamTrip

This is only necessary if you want to contribute to this project:

Requires node js: https://nodejs.org/en/

- Install yarn: https://classic.yarnpkg.com/en/docs/install/
- Clone this project and cd into its directory.
Then run:

```
yarn
yarn package
```

This builds the platform executables into the ./release directory.

## Details

In order to simplify setup, JamTrip makes the following assumptions:

- You're on a reasonably new computer with microphone or audio interface
- You're using the default CoreAudio sound system on your Mac
- Your desired sound input/output is selected from "System Preferences > Sound > Input/Output"
- You're sending only one channel of audio, probably a microphone
- Audio mix is mono

More exotic setups such as wanting to send multiple input channels and stereo mixes and other kinds of routing would probably be better suited for using JACK and JackTrip directly for now, but if there is enough interest can be added as new configuration options later.

PC support shouldn't be far behind once the kinks are ironed out.

Built in Electron + React
