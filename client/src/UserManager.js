import $ from 'jquery';

let user = null;
let userObject = null;
const API_SERVER_URL = window.location.host === "localhost:3000" ? "http://localhost:9980" : "https://backend.rapidbuilder.tech:9980";

class UserManager {
    constructor(user_, userToken) {
        user = user_;
        this.userToken = userToken;
    }

    resolveUserID(callback) {
        $.ajax({
            type: 'GET', url: API_SERVER_URL + "/user/" + user.uid,
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + this.userToken
            },
            success: function (result, status, xhr) {
                console.log(xhr.status);
                if (xhr.status === 200) {
                    userObject = JSON.parse(xhr.responseText)[0];
                    console.log(xhr.status);
                    console.log("success");
                    callback(xhr.status);
                } else {
                    console.log("error");
                    callback(xhr.status);
                }
            },
            error: function () {
                console.log("calling for error");
                callback(false);
            }
        });
    }

    getUserId() {
        return userObject ? userObject._id : null;
    }

    getUser() {
        return userObject;
    }

    updateUser(newUser, callback) {
        console.log("token", 'Bearer ' + this.userToken);
        if (newUser) {
            $.ajax(API_SERVER_URL + "/user/" + newUser._id, {
                type: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + this.userToken
                },
                data: newUser,
                success: (result, status, xhr) => {
                    console.log(result);
                    if (callback) {
                        this.resolveUserID(() => {
                            callback(xhr.status);
                        });
                    }
                },
                error: function (xhr) {
                    console.log(xhr);
                    if (callback) {
                        callback(xhr.status);
                    }
                }
            });
        }
    }

    resolveImageURL(callback) {
      $.ajax(`${API_SERVER_URL}/users/${userObject._id}/photo`, {
        type: 'GET',
        headers: {
          'Authorization': 'Bearer ' + this.userToken
        },
        xhrFields: {
          responseType: 'blob'
        },
        success: (result, status, xhr) => {
          console.log(result)
          if (callback) {
              callback(URL.createObjectURL(result));
          }
        },
        error: function (xhr) {
          console.log(xhr);
          if (callback) {
            callback(xhr.status);
          }
        }
      });
    }

  updateUserPhoto(file, callback) {
    let formdata = new FormData();
    formdata.append('file', file);
    console.log("token", 'Bearer ' + this.userToken);
    if (file) {
      $.ajax(`${API_SERVER_URL}/users/${userObject._id}/photo`, {
        type: 'POST',
        headers: {
          'Authorization': 'Bearer ' + this.userToken
        },
        processData: false,
        contentType: false,
        data: formdata,
        success: (result, status, xhr) => {
          console.log(result);
          if (callback) {
            this.resolveUserID(() => {
              callback(xhr.status);
            });
          }
        },
        error: function (xhr) {
          console.log(xhr);
          if (callback) {
            callback(xhr.status);
          }
        }
      });
    }
  }


  createCheckoutSession(plan, callback) {
    var url = "https://backend.rapidbuilder.tech:9980" + "/pricing/create_checkout_session";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.userToken)

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(xhr.status);
        console.log(xhr.responseText);
        callback(xhr.responseText)
      }};
    var data = '{"priceId":"' + this.getPriceByPlan(plan) + '"}';

    xhr.send(data);

  }

  getPriceByPlan(plan) {
      if (plan === "basic") {
        return "price_1LqdyMI4LEwWiy5R6dUIxiBf"
      } else if (plan === "professional") {
        return "price_1LqdyhI4LEwWiy5RN4EzqMWb"
      } else if (plan === "premium") {
        return "price_1Lqdz0I4LEwWiy5RUsUs3azk"
      } else if (plan === "enterprise") {
        return "price_1LqdzHI4LEwWiy5ROdt6YWKb"
      }
  }

    /**
     * Admin Function to load users
     */
    loadUsers(page, callback) {
        $.ajax({
            type: 'GET', url: API_SERVER_URL + "/users/" + page,
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + this.userToken
            },
            success: function (result, status, xhr) {
                console.log(xhr.status);
                if (xhr.status === 200) {
                    let users = JSON.parse(xhr.responseText);
                    console.log("users", users)
                    callback(users, true);
                } else {
                    callback(null, false);
                }
            },
            error: function () {
                console.log("calling for error");
                callback(null, false);
            }
        });
    }

    /**
     * Admin Function to deleteUsers
     */
    deleteUser(user, callback) {
        $.ajax({
            type: 'DELETE',
            url: API_SERVER_URL + "/users/" + user,
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + this.userToken
            },
            success: function (result, status, xhr) {
                console.log(xhr.status);
                if (xhr.status === 200) {
                    callback(true);
                } else {
                    callback(false);
                }
            },
            error: function () {
                console.log("calling for error");
                callback(false);
            }
        });
    }


    /**
     * Admin Function to promote users
     */
    promoteUser(user, admin, callback) {
        $.ajax({
            type: 'POST',
            url: API_SERVER_URL + "/users/admin/" + user,
            contentType: 'application/json',
            data: JSON.stringify({admin: admin}),
            headers: {
                'Authorization': 'Bearer ' + this.userToken
            },
            success: function (result, status, xhr) {
                console.log(xhr.status);
                if (xhr.status === 200) {
                    callback(true);
                } else {
                    callback(false);
                }
            },
            error: function () {
                console.log("calling for error");
                callback(false);
            }
        });
    }
}

export default UserManager;
