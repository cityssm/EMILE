[Home](https://cityssm.github.io/EMILE/)
•
[Help](https://cityssm.github.io/EMILE/docs/)

# Installation

EMILE can be run on modest hardware, however if EMILE will be configured to use
Green Button® Connect My Data (CMD), it is **not recommended** to run it on a user workstation.

## Step 1: Install Node.js 14 or better and npm

[Node.js](https://nodejs.org) is a JavaScript runtime environment.
EMILE is built to run on Node.js.

[npm](https://www.npmjs.com/) is a package manager that contains all the prerequisites
for the EMILE application.

Node.js can run on Windows, Mac, and Linux.
Installers on the [Node.js website](https://nodejs.org) include npm.
Node.js and npm are also available in most package managers.

    > sudo apt install nodejs
    > sudo apt install npm

## Step 2: Install git

_Alternatively, [releases are available on GitHub](https://github.com/cityssm/EMILE/releases)._
_Git is not required when using releases._

[Git](https://git-scm.com/) is the version control system that manages the
code for EMILE.

Git can run on Windows, Mac, and Linux.
You can install it using an install on the [Git website](https://git-scm.com/),
or from most package managers.

    > sudo apt install git

## Step 3: Clone the `EMILE` repository using git

Open a command line, and navigate to the folder where the application will reside.

    > git clone https://github.com/cityssm/EMILE

## Step 4: Install the dependencies

    > cd EMILE
    > npm install

## Step 5: Create a `config.js` file

It is recommended to copy the `config.base.js` file to get started.

    > cp data/config.base.js data/config.js

See the [config.js documentation](admin-configJS.md) for help customizing
your configuration.

## Step 6: Start the application

**Start Using npm**

    > npm start

**Start Using node**

    > node ./bin/www

**Start as a Windows Service**

The included `windowsService-install.bat` script simplifies
the process of keeping the application running in a Windows environment
by creating a service that can start with the hosting server.

    > npm link node-windows
    > windowsService-install

## Trademarks

® GREEN BUTTON is a registered trademark owned by Departments of the U.S. Government.
