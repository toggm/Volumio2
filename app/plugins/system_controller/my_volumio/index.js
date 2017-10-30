'use strict';

var libQ = require('kew');
var fs = require('fs-extra');
var firebase = require("firebase");
var unirest = require('unirest');
var uid = '';
var userLoggedIn = false;
var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var uuid = '';
var name = '';



module.exports = myVolumio;

function myVolumio(context)
{
    var self = this;

    self.context = context;
    self.commandRouter = self.context.coreCommand;
    self.logger = self.context.logger;
}

myVolumio.prototype.onVolumioStart = function ()
{
    var self = this;
    var configFile=self.commandRouter.pluginManager.getConfigurationFile(self.context,
        'config.json');
    self.config = new (require('v-conf'))();
    self.config.loadFile(configFile);
    
    return libQ.resolve();
};


myVolumio.prototype.onStart = function ()
{
    var self = this;
    var defer = libQ.defer();

    var config = {
        apiKey: "AIzaSyDzEZmwJZS4KZtG9pEXOxlm1XcZikP0KbA",
        authDomain: "myvolumio.firebaseapp.com",
        databaseURL: "https://myvolumio.firebaseio.com/",
        storageBucket: "gs://myvolumio.appspot.com"
    };

    var systemController = self.commandRouter.pluginManager.getPlugin('system_controller', 'system');
    name = systemController.getConf('playerName');
    uuid = systemController.getConf('uuid');
    firebase.initializeApp(config);
    self.myVolumioLogin();


    return defer.promise;
}

myVolumio.prototype.onStop = function () {
    var self = this;
    //Perform startup tasks here
};

myVolumio.prototype.onRestart = function () {
    var self = this;
    //Perform startup tasks here
};

myVolumio.prototype.onInstall = function () {
    var self = this;
    //Perform your installation tasks here
};

myVolumio.prototype.onUninstall = function () {
    var self = this;
    //Perform your installation tasks here
};

myVolumio.prototype.getUIConfig = function () {
    var self = this;
    var defer = libQ.defer();
    var lang_code = this.commandRouter.sharedVars.get("language_code");
    self.commandRouter.i18nJson(__dirname+'/../../../i18n/strings_'+lang_code+'.json',
        __dirname+'/../../../i18n/strings_en.json',
        __dirname + '/UIConfig.json')
        .then(function(uiconf) {

            //uiconf.sections[0].content[0].value = self.config.get('username');
            //uiconf.sections[0].content[1].value = self.config.get('password');

            defer.resolve(uiconf);
        })
        .fail(function () {
           defer.reject(new Error());
        });

    return defer.promise;
};

//manage parameters from config.json file of every plugin
myVolumio.prototype.retrievePlugConfig = function () {
    var self = this;

    return self.commandRouter.getPluginsConf();
}

myVolumio.prototype.login = function () {
    var self = this;
}

myVolumio.prototype.setUIConfig = function (data) {
    var self = this;
    //Perform your installation tasks here
};

myVolumio.prototype.getConf = function (varName) {
    var self = this;
    //Perform your installation tasks here
};

myVolumio.prototype.setConf = function (varName, varValue) {
    var self = this;
    //Perform your installation tasks here
};

//Optional functions exposed for making development easier and more clear
myVolumio.prototype.getSystemConf = function (pluginName, varName) {
    var self = this;
    //Perform your installation tasks here
};

myVolumio.prototype.setSystemConf = function (pluginName, varName) {
    var self = this;
    //Perform your installation tasks here
};

myVolumio.prototype.getAdditionalConf = function () {
    var self = this;
    //Perform your installation tasks here
};

myVolumio.prototype.setAdditionalConf = function () {
    var self = this;
    //Perform your installation tasks here
};

myVolumio.prototype.myVolumioLogin = function () {
    var self = this;

    //var token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJMSmd3SUhjQ2ZOYURma0F5V1JJUlF2SW11VlMyIiwiaWF0IjoxNTA5MzY3NzM0LCJleHAiOjE1MDkzNzEzMzQsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL2dvb2dsZS5pZGVudGl0eS5pZGVudGl0eXRvb2xraXQudjEuSWRlbnRpdHlUb29sa2l0IiwiaXNzIjoiZmlyZWJhc2UtYWRtaW5zZGstamlhNzFAbXl2b2x1bWlvLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstamlhNzFAbXl2b2x1bWlvLmlhbS5nc2VydmljZWFjY291bnQuY29tIn0.HUWMT0YkA4QBUC77yh_FISbyPhSHWvVzoOKkup9zxqHGEgY4lBvVMDnsP3HOe_3_JMT3ILY3Gde13Q3HH5rdW0ElNrgf2l7LE4ynWvdKx1PHn52MC06PUdgDsTS0lQxDcRK1x6-SrDFyIJaJaWzE2kUSVrWmtmlz4Zi9MESoIYT1s1SvGlI44PIOg6POCWxbYKffKEFbI-Gk_XYkXa-ibbpP5p0w8-RYxR__GGmeil32f5JYE6vqTD9y8MqSNXUkJdKxE3yQf898S8KRTRSmV_iOj1krmEcTlSIYC7xtRjbtjRSOjljeNmZ_f-W_s9ZFZenUQbtCscdGlNdS7IxOEg'
    //self.saveMyVolumioData({"token":token})
    var data = self.getMyVolumioData();
    var token = data.token;
    var username = data.username;
    var password = data.password;

    if (token != undefined && token.length > 0) {
        firebase.auth().signInWithCustomToken(token).catch(function(error) {
            if (error) {
                self.logger.error('MyVolumio FAILED LOGIN: ' + error.message);
                userLoggedIn = false;
            }
        });
    } else if (username != undefined && username.length > 0 && password != undefined && password.length > 0){
        firebase.auth().signInWithEmailAndPassword(username, password).catch(function(error) {
            if (error) {
                self.logger.error('MyVolumio FAILED LOGIN: ' + error.message);
                userLoggedIn = false;
            }
        });

    } else {
        self.logger.info('MyVolumio not started');
    }

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            userLoggedIn = true;
            uid = user.uid;
            self.logger.info('MYVOLUMIO SUCCESSFULLY LOGGED IN');
            firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {

            });
        } else {
            userLoggedIn = false;
            self.logger.info('MYVOLUMIO LOGGED OUT');
        }
    });
};



myVolumio.prototype.getMyVolumioStatus = function () {
    var self = this;
    var defer = libQ.defer();

    if (userLoggedIn) {
        var jsonobject = {"loggedIn":true, "uid":uid};
        defer.resolve(jsonobject)
    } else {
        var jsonobject = {"loggedIn":false}
        defer.resolve(jsonobject)
    }

    return defer.promise;
};

myVolumio.prototype.getMyVolumioToken = function (data) {
    var self = this;
    var defer = libQ.defer();

    if (userLoggedIn) {
        var endpoint = 'https://us-central1-myvolumio.cloudfunctions.net/generateToken?uid='+uid;
        self.logger.info('MYVOLUMIO Token request')
        unirest.get(endpoint)
            .end(function (response) {
                if (response.body === 'Error: could not handle the request') {
                    var jsonobject = {"tokenAvailable":false}
                    defer.resolve(jsonobject)
                } else {
                    var token = response.body;
                    var jsonobject = {"tokenAvailable":true, "token":token}
                    defer.resolve(jsonobject)
                }
            });
    } else {
        var jsonobject = {"tokenAvailable":false}
        defer.resolve(jsonobject)
    }

    return defer.promise;
};

myVolumio.prototype.setMyVolumioToken = function (data) {
    var self = this;
    var defer = libQ.defer();

    if (data.token != undefined && data.token.length > 0 ){
        var token = data.token;
        defer.resolve(token)
    }

    if (userLoggedIn) {

    } else {
        self.saveMyVolumioData({"token":data.token})
    }

    return defer.promise;
};

myVolumio.prototype.encrypt = function (data) {
    var cipher = crypto.createCipher(algorithm,uuid)
    var crypted = cipher.update(data,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
};

myVolumio.prototype.decrypt = function (data) {
    var decipher = crypto.createDecipher(algorithm,uuid)
    var dec = decipher.update(data,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
};

myVolumio.prototype.saveMyVolumioData = function (data) {
    var self = this;

    if (data.username != undefined && data.username.length > 0) {
        var username = self.encrypt(data.username)
        self.config.set('username', username)
    }

    if (data.password != undefined && data.password.length > 0) {
        var password = self.encrypt(data.password)
        self.config.set('password', password)
    }

    if (data.token != undefined && data.token.length > 0) {
        //var token = self.encrypt(data.token)
        var token = data.token
        self.config.set('token', token)
    }
    self.myVolumioLogin();
};

myVolumio.prototype.getMyVolumioData = function () {
    var self = this;
    var data = {};

    try {
        var username = self.config.get('username')
        if (username != undefined && username.length > 0) {
            data.username = self.decrypt(username);
        }

        var password = self.config.get('password')
        if (password != undefined && password.length > 0) {
            data.password = self.decrypt(password);
        }

        var token = self.config.get('token')
        if (token != undefined && token.length > 0) {
            //data.token = self.decrypt(token);
            data.token = token;
        }
    } catch(e) {
        self.logger.error('Cannot get login credentials')
    }



   return data
};

myVolumio.prototype.getValueFromDB = function (data) {
    var self = this;


    if (userLoggedIn) {
        firebase.database().ref('/users/' + uid).once('value').then(function(snapshot) {

        });
    } else {

    }

};

myVolumio.prototype.myVolumioLogout = function () {
    var self = this;

    self.config.set('username', '')
    self.config.set('password', '')
    self.config.set('token', '')
    firebase.auth().signOut();
    setTimeout(function(){
        self.myVolumioLogin();
    },2000)


};
