const users = [];


//Join user to chat
function userJoin (id, username, room) {
    const user = { id, username, room };

    let regExp = /^[a-zа-яё -]+$/i

    if (!regExp.test(user.username)) {
        user.username = user.id.slice(0, 7).toLowerCase();
    }
    else {
        getRoomUsers(user.room).forEach( u => {
            if (u.username === user.username) {
                user.username += '__' + user.id.slice(3, 7).toUpperCase(); 
            }
        })
    }

    users.push(user);

    return user;
}

//Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

//User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

//Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
};