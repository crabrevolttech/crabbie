var Showdown = new showdown.Converter();

window.addEventListener('click', function() {
    HideAllContextMenus();
});

function ListenForContext(element,func) {
    element.addEventListener('contextmenu',function(event) {
        event.preventDefault()
        func({
            x: event.clientX,
            y: event.clientY
        })
    });
}


var smallScreen = false;
setInterval(function () {
    var sidebar = document.querySelector('.sidebar')
    if(window.innerWidth < 741) {
        if(!smallScreen) {
            sidebar.className = 'sidebar'
        }
        smallScreen = true;
    } else {
        if(smallScreen) {
            sidebar.className = 'sidebar'
        }
        smallScreen = false;
    }
});

function mmToggleSidebar() {
    if(document.querySelector('.sidebar').className == 'sidebar') {
        mmSidebarOpen()
    } else {
        mmSidebarClose()
    }
}

function mmSidebarOpen() {
    document.querySelector('.sidebar').className = 'sidebar mmopen'
}

function mmSidebarClose() {
    document.querySelector('.sidebar').className = 'sidebar'
}

function HideAllContextMenus() {
    document.querySelectorAll('.context-menu').forEach(menu => {
        menu.parentNode.removeChild(menu);
    });
}


function ShowContextMenu(x,y,items) {
    HideAllContextMenus()
    var div = document.createElement('div');
    div.className = 'context-menu';
    items.forEach(item => {
        var e = document.createElement('div');
        e.className = 'context-menu-item';
        e.innerText = item.name;
        e.onclick = function () {
            item.onclick();
        }
        div.appendChild(e);
    });
    document.body.appendChild(div);
    var height = window.innerHeight - div.offsetHeight - 10;
    var width = window.innerWidth - div.offsetWidth - 10;
    if(y > height) {
        div.style.bottom = (window.innerHeight - y)+'px';
    } else {
        div.style.top = y + 'px';
    }
    if(x > width) {
        div.style.right = (window.innerWidth - x)+'px';
    } else {
        div.style.left = x + 'px';
    }
}



var UI = {
    Alert: (m,onok) => {
        document.querySelector('.warning-alert').style.display = '';
        document.querySelector('.warning-alert p').innerHTML = m;
        document.querySelector('.warning-alert .alert-buttons').onclick = function () {
            document.querySelector('.warning-alert').style.display = 'none';
            try {
                onok()
            } catch (error) {
                return null;
            }
        }
    }
}

CrabbieAccounts.GetUser().then(user => {
    document.querySelector('.account-name').innerText = user.email;
    main(user);
});

var SelectedChat = -1;

async function main(user) {
    if((await CrabbieAccounts.GetConversations()).length < 1) {
        await CrabbieAccounts.CreateChat({
            model: 'gpt-3.5-turbo'
        });
    }
    SelectedChat = 0;
    UpdateChats();
    LoadSelectedChat();
}

async function LoadSelectedChat() {
    var chats = await CrabbieAccounts.GetConversations();
    var chat = chats[SelectedChat];
    if(!chat) {
        return UI.Alert('An error occurred loading the chat. Please refresh the page and try again.');
    }
    var messages = chat.messages;
    var area = document.querySelector('.chat-messages');
    area.innerHTML = "";
    messages.forEach(message => {
        CreateMessageInArea(message);
    });
}

var reply_to = [];

setInterval(_ => {
    var rt = document.querySelector('.replying-to');
    var sp = rt.querySelector('span');
    if(reply_to[SelectedChat] != undefined) {
        sp.innerText = reply_to[SelectedChat].length > 10 ? reply_to[SelectedChat].slice(0,7)+"..." : reply_to[SelectedChat];
        rt.style.display = ''
    } else {
        rt.style.display = 'none'
    }
});

function CreateMessageInArea(message) {
    if(message.hidden){return}
    var area = document.querySelector('.chat-messages');
    var mE = document.createElement('div');
    mE.className = 'chat-message';
    ListenForContext(mE, context => {
        if(message.type == 'assistant') {
            ShowContextMenu(
                context.x,
                context.y,
                [
                    {
                        name: 'Reply',
                        onclick: _ => {
                            reply_to[SelectedChat] = message.content
                        }
                    }
                ]
            )
        }
    });
    var pE = document.createElement('img');
    pE.src = message.type == 'user' ? 'fa-fa-user.png':'assistant_icon.jpg';
    pE.className = 'chat-message-icon';
    mE.appendChild(pE);
    var cE = document.createElement ('div');
    cE.className = 'chat-message-content';
    cE.innerHTML = Showdown.makeHtml(message.content);
    mE.appendChild(cE);
    area.appendChild(mE)
}

async function UpdateChats() {
    var m = document.querySelector('.chat-list');
    m.innerHTML = '';
    var chats = await CrabbieAccounts.GetConversations();
    chats.forEach((chat,i) => {
        var e = document.createElement('div');
        e.className = (
            i == SelectedChat ?
            'desktop-option chat-list-entry chat-list-entry-selected' :
            'desktop-option chat-list-entry'
        );
        e.innerHTML = `<i class='fa-solid fa-message'></i> <span class='chat-entry-title'></span>`;
        e.querySelector('.chat-entry-title').innerText = chat.name;
        CreateChatControlButtons(e,chat,i)
        m.appendChild(e);
    });
}

function CreateChatControlButtons (e,chat,i) {
    // to-do
}

async function SendTheMessage(textarea) {
    var value = textarea.value;
    var chat = (await CrabbieAccounts.GetConversations())[SelectedChat];
    if(reply_to[SelectedChat] != undefined) {
        await CrabbieAccounts.AddMessage(SelectedChat, 'system',`The user is replying to your message "${reply_to[SelectedChat]}"`,true);
        reply_to[SelectedChat] = undefined;
    }
    textarea.value = "";
    await CrabbieAccounts.AddMessage(SelectedChat, 'user',value,false);
    CreateMessageInArea({type:'user',content:value});
    CrabbieAI.GetResponseGPT35(chat.messages, data => {
        CrabbieAccounts.AddMessage(SelectedChat, 'assistant',data.chunk,false);
        CreateMessageInArea({type:'assistant',content:data.chunk});
    });
}

function PremiumUpdateDialog() {
    UI.Alert(
        `Enjoy the MANY benefits of Crabbie Premium:<ul> <li>Use GPT-4 with 32-token context</li></ul> For only $10/year - that's $1 PER MONTH!<br>Upgrade to Premium in your account settings.`
    )
}

function ShowUserOptions() {
    UI.Alert("This part of the UI hasn't been implemented yet.<br>Don't worry; it'll be in the demo soon!")
}
