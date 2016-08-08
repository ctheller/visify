'use strict';
var passport = require('passport');
var SpotifyStrategy = require('passport-spotify').Strategy;

module.exports = function (app, db) {

    var User = db.model('user');

    var spotifyConfig = app.getValue('env').SPOTIFY;

    var spotifyCredentials = {
        clientID: spotifyConfig.clientID,
        clientSecret: spotifyConfig.clientSecret,
        callbackURL: spotifyConfig.callbackURL
    };

    var verifyCallback = function (accessToken, refreshToken, profile, done) {

        User.update({
                access_token: accessToken,
                refresh_token: refreshToken,
            },
            {
                where: {
                    spotify_id: profile.id
                }, returning: true
            })
            .then(function (user) {
                if (user[0]) {
                    return user[1][0];
                } else {
                    return User.create({
                        spotify_id: profile.id,
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        email: profile.email
                    });
                }
            })
            .then(function (userToLogin) {
                done(null, userToLogin);
            })
            .catch(function (err) {
                console.error('Error creating user from spotify authentication', err);
                done(err);
            })

    };

    passport.use(new SpotifyStrategy(spotifyCredentials, verifyCallback));

    app.get('/auth/spotify', passport.authenticate('spotify', {scope: ['user-read-email', 'playlist-read-private', 'user-read-private', 'user-library-read'] }));

    app.get('/auth/spotify/callback',
        passport.authenticate('spotify', {failureRedirect: '/login'}),
        function (req, res) {
            res.redirect('/');
        });


};
