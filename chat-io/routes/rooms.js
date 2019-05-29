module.exports = function(io) {

    const express = require('express');

    const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');



    io.sockets.on('connection', function(socket) {
        console.log('a user is connected')
    
        //передача сообщений в комнате чата
        socket.on('create', function(room) {
            socket.join(room);
            console.log("Room: " + room + " was created")

            io.sockets.in(room).emit('testing', "hi from server room: " + room);

            socket.on('message', function(msg, username) {
                console.log('сообщение от юзера| ' + username + ": " + msg)
                io.sockets.in(room).emit('msg_to_chat', msg, username);
            })

            socket.on('disconnect', function(msg, username) {
                console.log('сообщение от юзера| ' + username + ": " + msg)
                io.sockets.in(room).emit('msg_to_chat', "Пользователь: " + username + "покинул комнату: " + room);
            })
        });
    })

    const router = express.Router();
    const bcrypt = require('bcryptjs');

    // const passportToRoom = require('passport');
    const passport = require('passport');

    // Load User model
    const User = require('../models/User');
    const Room = require('../models/Room');


    var onlineRooms = []


    var mapRoom = []

    function dinamicRoute(router, io) {
        mapRoom.forEach(function(routerObj) {

            router.get('/' + routerObj.route, ensureAuthenticated, (req, res) => {


                console.log("AFTER CREATE");
                console.log("############");


                console.log("SEARCHIND activeRoom");
                console.log(req.user);

                console.log("INCLUDES activeRoom");
                console.log(onlineRooms.includes(req.user.activeRoom));
                console.log(routerObj.route);

                if (req.user.activeRoom == routerObj.route) {



                    Room.findOne({ name: routerObj.route })
                        .then(room => {
                            console.log('room')
                            console.log(room)
                            // console.log(room[0].users)
                            console.log(room.users)

                            var mass = room.users
                            var admin = room.admin
                            mass.forEach((e) => {
                                console.log('e')
                                console.log(e)
                            })

                            res.render('chat', {

                                //сокет комната регистрируется в socket.on('create'...)
                                user: req.user,
                                roomUsers: mass,
                                admin: admin
                            });

                        })
                        .catch(err => {
                            res.redirect('/rooms')
                        })
                } else {
                    res.redirect('/rooms')
                }
            })
        })
    }

    router.get('/ajaxUserList', ensureAuthenticated, (req, res) => {

        Room.findOne({ name: req.user.activeRoom })
            .then(room => {
                console.log('room')
                console.log(room)
                // console.log(room[0].users)
                console.log(room.users)

                var mass = room.users

                res.send({
                    userList: mass,
                });

            })
            .catch(err => {
                console.log(err)
            })
    })


    router.get('/killRoom', ensureAuthenticated, (req, res) => {
        Room.deleteOne({ name: req.user.activeRoom }).then(room => {
                console.log(room)

                mapRoom = (mapRoom).splice(mapRoom.indexOf(room.name), 1)
                res.redirect('../rooms')

            })
            .catch(err => {
                console.log(err)
            })
    })

    router.get('/leaveRoom', ensureAuthenticated, (req, res) => {

        Room.findOne({ name: req.user.activeRoom }).then(room => {
                console.log('//leftRoom')

                console.log(req.user.name)
                room.users.splice(room.users.indexOf(req.user.name), 1)
                console.log(room.users)
                // User.findOne({ email: req.user.email }).then(user => {
                //     user.activeRoom = ""
                //     user.save()
                //         .then(user => {
                //             req.flash(
                //                 'success_msg',
                //                 'user delete'
                //             );
                //             console.log(req.user.activeRoom)

                //         })
                //         .catch(err => { console.log(err) })
                // })


                room.save().then(room => {
                        User.findOne({ email: req.user.email }).then(user => {
                            user.activeRoom = ""
                            user.save()
                                .then(user => {
                                    req.flash(
                                        'success_msg',
                                        'user delete'
                                    );
                                    console.log(req.user.activeRoom)

                                })
                                .catch(err => { console.log(err) })
                        })
                        res.redirect('../rooms')
                    })
                    .catch(err => console.log(err));

            })
            .catch(err => {
                console.log(err)
            })


    })




    //сделай на разные адреса посты 
    router.post('/post', ensureAuthenticated, (req, res) => {
        var usename = req.user.name
        console.log("GRAND TEST " + usename)
        var count = Object.keys(req.body).length;
        console.log(count);
        console.log("U IN POST ROOMS WITH CREATE POST")
        console.log(req.body)

        if (count == 4) //CREATE POST
        {
            const { name, password, password2, welcomeMess } = req.body;
            let errors = [];
            console.log("POST CREATE")
            console.log(req.body)

            if (!name || !password || !password2) {
                errors.push({ msg: 'Please enter all fields' });
            }

            if (password != password2) {
                errors.push({ msg: 'Passwords do not match' });
            }

            if (password.length < 3) {
                errors.push({ msg: 'Password must be at least 6 characters' });
            }

            if (errors.length > 0) {
                res.render('rooms', {
                    errors,
                    name,
                    password,
                    password2
                });
            } else {
                Room.findOne({ name: name }).then(room => {
                    if (room) {
                        errors.push({ msg: 'Room already exists' });
                        res.render('rooms', {
                            errors,
                            name,
                            password,
                            password2
                        });
                    } else {

                        const newRoom = new Room({
                            name,
                            password
                        });

                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newRoom.password, salt, (err, hash) => {
                                if (err) throw err;
                                newRoom.password = hash;
                                newRoom.admin = req.user.email
                                newRoom
                                    .save()
                                    .then(room => {
                                        req.flash(
                                            'success_msg',
                                            'room created'
                                        );
                                        console.log("ROOM WAS CREATED")

                                        User.findOne({ name: req.user.name }).then(user => {
                                            if (user) {
                                                user.activeRoom = room.name
                                                user.save().then(user => { console.log("ROOM ADDED to user: " + user.email) }).catch(err => console.log(err));
                                            }
                                        }).catch(err => {
                                            console.log(err);
                                        })

                                        let routerObj = {}
                                        routerObj.route = room.name
                                        mapRoom.push(routerObj)
                                        console.log("test2")

                                        Room.findOne({ name: name }).then(room => {

                                                if ((room.users).includes(req.user.name)) {
                                                    console.log("user: " + req.user.name + " already in the room: " + room.name)
                                                } else {
                                                    room.users.push(req.user.name)
                                                    console.log("in room/ " + room.name + " user:" + name + " pushed")
                                                    room.save().then(user => { console.log("ROOM UPDATED") }).catch(err => console.log(err));
                                                }
                                                dinamicRoute(router, io)
                                                res.redirect('/rooms/' + room.name);
                                            })
                                            .catch(err => { console.log(err) })
                                    })
                                    .catch(err => console.log(err));
                            });
                        });
                    }
                });
            }


        } else if (count == 2) {

            // join POST
            const { name, password } = req.body;


            // bcrypt.compare(password, user.password, function(err, res) {
            //         if (err) {
            //             // handle error
            //         }
            //         if (res)
            //         // Send JWT
            //     } else {
            //         // response is OutgoingMessage object that server response http request
            //         return response.json({ success: false, message: 'passwords do not match' });
            //     }
            // });


            Room.findOne({ name: name }).then(room => {



                if (room) {
                    // errors.push({ msg: 'Room already exists' });
                    bcrypt.compare(password, room.password, function(err, resp) {
                        if (err) {
                            console.log(err)
                        }
                        if (resp) {
                            //Добавляем пользователю комнату
                            // req.user.activeRoom = room.name
                            User.findOne({ email: req.user.email }).then(user => {
                                    if (user) {
                                        user.activeRoom = room.name
                                        user.save().then(user => { console.log("ROOM ADDED to user: " + user.email) }).catch(err => console.log(err));
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                            //добавляет в комнату пользователя
                            if (room.users.includes(req.user.name)) {
                                console.log("user: " + req.user.name + " already in the room: " + room.name)
                            } else {
                                room.users.push(req.user.name)
                                console.log("in room/ " + room.name + " user:" + name + " pushed")
                                room.save().then(room => { console.log("ROOM UPDATED") }).catch(err => console.log(err));
                            }



                            let routerObj = {}
                            routerObj.route = room.name
                            mapRoom.push(routerObj)


                            dinamicRoute(router, io)


                            res.redirect('/rooms/' + room.name);
                        }
                    });









                    // room.users.push(req.user.name)



                    // console.log("in room/ " + room.name + " user:" + name + " pushed")
                    // room.save().then(user => { console.log("ROOM UPDATED") }).catch(err => console.log(err));
                    // res.redirect('/rooms/rooms/' + name);

                }

            })
        }
    });

    // module.exports = router;
    return router;
}