# EMILE (Energy Monitoring in Less Effort)

<img src="public/images/logo.svg" alt="Emile" align="right" style="height:250px" />

[![DeepSource](https://app.deepsource.com/gh/cityssm/EMILE.svg/?label=active+issues&show_trend=true&token=AT4qy65eeZIecqOz7zA-UKo8)](https://app.deepsource.com/gh/cityssm/EMILE/?ref=repository-badge)
[![Maintainability](https://api.codeclimate.com/v1/badges/0908ba3507dfddc4408b/maintainability)](https://codeclimate.com/github/cityssm/EMILE/maintainability)
[![codecov](https://codecov.io/gh/cityssm/EMILE/graph/badge.svg?token=6SJNVR7IJO)](https://codecov.io/gh/cityssm/EMILE)
[![EMILE](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/simple/6u22zp/main&style=flat&logo=cypress)](https://cloud.cypress.io/projects/6u22zp/runs)

_Pronounced like Emily_

An application to collect and aggregate energy consumption data across several municipal assets
and report usage to monitor and manage emissions.
Makes bringing together Green Button® and CSV data sources a breeze!

## Available Inputs

- ✔️ Green Button® formatted XML acquired manually through the [Download My Data (DMD) standard](https://www.greenbuttonalliance.org/green-button-download-my-data-dmd).
- ✔️ CSV files.
- ✔️ Green Button® formatted XML acquired automatically through the [Connect My Data (CMD) standard](https://www.greenbuttonalliance.org/green-button-connect-my-data-cmd), compatible with:
  - [UtilityAPI](https://utilityapi.com/), namely their [integration with PUC Distribution Inc.](https://utilityapi.com/docs/utilities/ssmpuc)

## Outputs, Exports, and Reports

- ✔️ Graphs.
- ✔️ CSV files.
- ✔️ Power Query compatible URLs for refreshable data in Microsoft Excel and Microsoft Power BI.
- ✔️ SQLite database file.
- ✏️ [Energy Star Portfolio Manager](https://portfoliomanager.energystar.gov/pm/login) data.
- ✏️ [Partners for Climate Protection Milestone Tool](https://pcptool.ca/) data.

## About this Project

![EMILE Dashboard](docs/images/dashboard.png)

📘 **[User Documentation (In The Works)](https://cityssm.github.io/EMILE/docs/)**

- 🤗 [Code of Conduct](CODE_OF_CONDUCT.md)
- 🥰 [Contributing Guidelines](CONTRIBUTING.md)
- 🛡️ [Security Policy](SECURITY.md)
- 📃 [MIT Licence](LICENSE.md)

Although the system is quite niche, it's being released in an open source environment in hopes to pool developer resources from other municipalities looking to solve the same problems
and move away from older, legacy systems.

It is being shared to start the dialog among other municipalities and present an option to those who may be looking to refresh or upgrade their energy usage tracking.

## More Projects from the City of Sault Ste. Marie

EMILE's energy usage monitoring is made possible using the City of Sault Ste. Marie's
[Green Button® Parser for Node](https://github.com/cityssm/node-green-button-parser)
and [Green Button® Subscriber for Node](https://github.com/cityssm/node-green-button-subscriber).

The City of Sault Ste. Marie also has
[several other open source applications](https://cityssm.github.io/)
available for managing municipal operations.

- 💡 **[General Licence Manager](https://github.com/cityssm/general-licence-manager)** - An application built to manage the general licences issued by municipalities.
- 💡 **[Lottery Licence Manager](https://github.com/cityssm/lottery-licence-manager)** - An application for managing AGCO's municipal lottery licensing requirements in Ontario.

[Browse our GitHub account](https://github.com/cityssm/) for more of the City's offerings.

## Trademarks

® GREEN BUTTON is a registered trademark owned by Departments of the U.S. Government.

The City of Sault Ste. Marie is a [Liaison member of the Green Button Alliance](https://www.greenbuttonalliance.org/members/sault-ste-marie).
