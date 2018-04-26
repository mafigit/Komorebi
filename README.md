# Komorebi

Komorebi is a digital Kanban/Scrum Board solution with focus on a minimal
feature set. It is designed as an inhouse solution. Which means there is no
focus on security.

![Screenshot](https://raw.github.com/mafigit/komorebi/master/screenshot.png)

## Framework and overall design

### Frontend
Frontend is written in React.js with Material-UI.
To build the front end you need node/npm already installed.

### Backend
The backend is written in go and uses a sqlite3 Database.


## Installation

### Requirements
- Golang (1.7+)
- npm
- gulp

### Build
```
cd client/ && npm install
cd server/src/komorebi && go get
cd server/ && make
./server/bin/komorebi -port 80
```


## Notes for contributers

### Examples for material-ui
[Demo](http://www.material-ui.com/#/components/app-bar)

### Color Palette
   * green: 129793
   * dark-gray: 505050
   * light-yellow: FFF5C3
   * ligth-green: 9BD7D5
   * light-red: FF7260

http://s3.amazonaws.com/colorcombos-images/users/1/color-schemes/color-scheme-285-main.png?v=20111020201003
