const socket = io('/');

const videGrid = document.getElementById('video-grid');

const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: "443"
});
let myVideoStream;
let getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) =>{
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // peer.on("call", (call)=>{
    //     console.log('wr')
    //     call.answer(stream);
    //     const video = document.createElement('video');
        
    //     call.on('stream', (userVideoStream)=>{
    //         addVideoStream(video, userVideoStream);
    //     })
    // })

    socket.on('user-connected', (userId)=>{
        console.log(`User connected : ${userId}`)
        connectToNewUser(userId, stream);
    })    

    socket.on('createMessage', (message)=>{
        let li = document.createElement('li');
        li.innerHTML = `<b>User</b><br>${message}`;;
        chatMessages.append(li);
    })
})

peer.on("call", function(call){
    getUserMedia({
        video: true,
        audio: true,
    }, function(stream){
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream)=>{
            addVideoStream(video, userVideoStream);
        })
    },
    function(err){
        console.log('Failed to get local stream', err);
    })
})


peer.on("open", (id)=>{
    console.log(id)
    socket.emit('join-room', ROOM_ID, id);
})

const connectToNewUser = (userId, stream)=>{
    let call = peer.call(userId, stream);
    console.log(call);
    let video = document.createElement('video');
    call.on('stream', (userVideoStream)=>{
        console.log(userVideoStream);
        addVideoStream(video, userVideoStream);
    })
}


const addVideoStream = (video, stream) =>{
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', ()=>{
        video.play();
    })
    videGrid.append(video);
}

// MESSAGE SCRIPT
const chatMessages = document.getElementById('chat-messages');
let inputMessage = document.getElementById("chat_message");
const onMessageKeyPress = (event)=>{
    if(event.keyCode === 13 && inputMessage.value != ''){
        let message = inputMessage.value;
        let li = document.createElement('li');
        li.innerHTML = `<b>User</b><br>${message}`;
        chatMessages.append(li);
        socket.emit('message', ROOM_ID, message)
        inputMessage.value = '';
    }
}

// STOP VIDEO
const playStop = ()=>{
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    }else{
        myVideoStream.getVideoTracks()[0].enabled = true;
        setStopVideo();
    }
}

const setPlayVideo = ()=>{
    const html = `<i class="fas fa-video-slash"></i><span class="unmute">Resume Video</span>`;
    document.getElementById('playPauseVideo').innerHTML = html;
    document.getElementById('playPauseVideo').classList.add('unmute');

}

const setStopVideo = ()=>{
    const html = `<i class="fas fa-video"></i><span>Stop Video</span>`;
    document.getElementById('playPauseVideo').innerHTML = html;
    document.getElementById('playPauseVideo').classList.remove('unmute');
}


// MUTE
const muteUnmute = ()=>{
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    console.log(myVideoStream.getAudioTracks()[0].enabled)
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        console.log(myVideoStream.getAudioTracks()[0].enabled)
        setUnmuteButton();
    }else{
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
}


const setUnmuteButton = ()=>{
    const html = `<i class="fas fa-microphone-slash"></i><span class="unmute">Unmute</span>`;
    document.getElementById('muteButton').innerHTML = html;
    document.getElementById('muteButton').classList.add('unmute');

}

const setMuteButton = ()=>{
    const html = `<i class="fas fa-microphone"></i><span>Mute</span>`;
    document.getElementById('muteButton').innerHTML = html;
    document.getElementById('muteButton').classList.remove('unmute');
}

// STOP VIDEO
