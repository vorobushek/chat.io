const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Room = require('../models/Room');
// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

var roomsList;

router.get('/rooms', ensureAuthenticated, (req, res) => {
    //ищем в бд комнаты, каждую команту записываем в json и отправляем клиенту 
    roomsList = []


    Room.find()
        .then(rooms => {
            if (rooms) {
                rooms.forEach((room) => {
                    roomObj = {}
                    roomObj.name = room.name
                    roomObj.userNum = room.users.length
                    roomsList.push(roomObj)

                })

                res.render('rooms', {
                    user: req.user,
                    rooms: roomsList

                })

            }
        })
        .catch(err => {
            console.log(err);
        });


});

router.get('/ajaxData', ensureAuthenticated, (req, res) => {
    //ищем в бд комнаты, каждую команту записываем в json и отправляем клиенту 
    res.send({
        rooms: roomsList
    })

});



module.exports = router;



// <%rooms.forEach((e)=>{%>
//                        <tr>
//                            <td>
//                                <%=e.name%>
//                            </td>
//                            <td>
//                                <%=e.userNum%>
//                            </td>
//                            <td align="center">
//                                <button type="button" class="btn btn-mini col-5" data-toggle="modal" data-target="#exampleModalForTest"><i class="fas fa-paper-plane"></i></button>
//                            </td>
//                        </tr>
//                        <% })%>