var CrabbieAccounts = {
    LogOut: async function () {
        UI.Alert("This is a demo UI, and this feature is not functional in it.");
    },
    GetUser: async function () {
        return {
            email: 'demo-ui@crabbie',
            plan: 'free',
            token: null
        }
    },
    GetConversations: async function () {
        this.dPREPCHATS();
        return JSON.parse(localStorage.conversations);
    },
    dGCL: async function () {
        this.dPREPCHATS();
        return JSON.parse(localStorage.conversations);
    },
    dPREPCHATS: async function () {
        try {
            if(!localStorage.conversations){throw 0}
            JSON.parse(localStorage.conversations)
        } catch (e) {
            localStorage.conversations = "[]"
        }
    },
    dSETCHATS: async function (_) {
        localStorage.conversations = JSON.stringify(_)
    },
    RenameChat: async function (index, name) {
        var chat = (await this.dGCL())[index];
        if(!chat) {
            return UI.Alert('The chat you tried to rename doesn\'t exist.')
        }
        chat.name = name || "New Chat";
        var chats = (await this.dGCL());
        chats[index] = chat;
        this.dSETCHATS(chats);
    },
    GetPrompts: async function (index) {
        var chat = ((await this.dGCL()))[index];
        if(!chat) {
            throw UI.Alert('The chat you tried to access doesn\'t exist.');
        }
        return chat.messages
    },
    AddMessage: async function (index, type, content, hidden) {
        var chat = (await this.dGCL())[index];
        if(!chat) {
            throw UI.Alert('The chat you tried to access doesn\'t exist.');
        }
        var chats = (await this.dGCL());
        chat.messages.push({
            type: type,
            hidden: hidden,
            content: content
        });
        chats[index] = chat;
        this.dSETCHATS(chats);
    },
    RemoveChat: async function (index) {
        var chat = ((await this.dGCL()))[index];
        if(!chat) {
            throw UI.Alert('The chat you tried to delete doesn\'t exist.');
        }
        var chats = (await this.dGCL());
        chats[index] = null;
        var nC = [];
        chats.forEach(E => {
            if(E != null) {
                nC.push(E)
            }
        })
        this.dSETCHATS(nC);
    },
    CreateChat: async function (model) {
        var chat = {
            name: 'New Chat',
            model: model,
            messages: []
        }
        var chats = (await this.dGCL());
        chats.push(chat);
        this.dSETCHATS(chats);
    },
}

setTimeout(_ => {
    if(!localStorage.getItem('SeenInitialWarning')) {
        UI.Alert(
            "Crabbie is your assistant for anything related to "+
            "the Crab Revolt.",
            ok => {
                UI.Alert(
                    "Crabbie may occasionally produce inaccurate information or make up facts it doesn't know.", ok => {
                        localStorage.setItem('SeenInitialWarning','_')
                    }
                )
            }
        )
    }
}, 1000)
