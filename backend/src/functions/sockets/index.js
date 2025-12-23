// * Socket functions

// ? add user to online users array
export const addUser = async (user, socket) => {
  const index = global.onlineUsers.findIndex((exUser) => {
    return exUser.user._id == user._id;
  });

  if (index == -1) {
    global.onlineUsers.push({
      user,
      socket,
    });
  } else {
    global.onlineUsers[index].socket = socket;
  }
  console.log(global.onlineUsers);
};

// ? remove user from online users array
export const removeUser = async (socket) => {
  const removedUser = global.onlineUsers.find((exUser) => {
    return exUser.socket == socket;
  });
  if (removedUser !== undefined && removedUser !== null) {
    global.onlineUsers = global.onlineUsers.filter((exUser) => {
      return exUser.socket !== socket;
    });
    console.log("removed user", removedUser);
  } else {
    console.log("user not found");
  }
};
