let localStream;
let peerCon;

let servers = {
    iceServers:[
        {
            urls:['stun:stun1.1.google.com:19302','stun:stun2.1.google.com:19302']
        }
    ]
}
const init = async()=> {
    localStream = await navigator.mediaDevices.getUserMedia({audio:true,video:true});
    document.getElementById('local-stream').srcObject = localStream;
}

let createPeerConnection = async(sdptype)=>{ //THIS IS COMMON CODE IN BOTH CREATE-OFFER AND CREATE-ANSWER
    //for creating offer we first need peerConnection, since offer resides in it
    peerCon = new RTCPeerConnection(servers);
    //remote-Stream
    remoteStream = new MediaStream();
    document.getElementById('remote-stream').srcObject = remoteStream;
    //adding localStream Media(audio and video tracks) using tracks to transfer audio and video over the peer-connection
    localStream.getTracks().forEach((track)=>{
        peerCon.addTrack(track,localStream);
    })
    //response of remoteStream-Media to localStream-tracks can be done via selecting tracks from peerConn and then adding the localStream Tracks to remoteStream 
    peerCon.ontrack = async (event) =>{
        event.streams[0].getTracks().forEach((track)=>{
            remoteStream.addTrack(track);
        })
    }

    //onicecandidate triggers when iceCandidates from iceServers(STUN Servers) are added, this changes the sdp-offer/localDescription of the peer-connection  
    peerCon.onicecandidate = async (event) =>{
        if(event.candidate){ //here slight-change-> sdp-answer is set in as the localDescription, since it is remoteStream which responds with answer to offer
            document.getElementById(sdptype).value = JSON.stringify(peerCon.localDescription);
        }
    }
}

const createOffer=async()=> { //FROM LOCAL-STREAM POV
    // //for creating offer we first need peerConnection, since offer resides in it
    // peerCon = new RTCPeerConnection(servers);
    // //remote-Stream
    // remoteStream = new MediaStream();
    // document.getElementById('remote-stream').srcObject = remoteStream;
    // //adding localStream Media(audio and video tracks) using tracks to transfer audio and video over the peer-connection
    // localStream.getTracks().forEach((track)=>{
    //     peerCon.addTrack(track,localStream);
    // })
    // //response of remoteStream-Media to localStream-tracks can be done via selecting tracks from peerConn and then adding the localStream Tracks to remoteStream 
    // peerCon.ontrack = async (event) =>{
    //     event.streams[0].getTracks().forEach((track)=>{
    //         remoteStream.addTrack(track);
    //     })
    // }

    //onicecandidate triggers when iceCandidates from iceServers(STUN Servers) are added, this changes the sdp-offer/localDescription of the peer-connection  
    // peerCon.onicecandidate = async (event) =>{
    //     if(event.candidate){
    //         document.getElementById('sdp-offer').value = JSON.stringify(peerCon.localDescription);
    //     }
    // }
    createPeerConnection('sdp-offer');

    //creating the offer
    const offer = await  peerCon.createOffer();
    //each peer-connection b/w 2 devices has local and remote description :
    await peerCon.setLocalDescription(offer);
    document.getElementById('sdp-offer').value = JSON.stringify(offer);
}

const createAnswer=async()=> { //FROM REMOTE-STREAM POV
    // peerCon = new RTCPeerConnection(servers);
    // //remote-Stream
    // remoteStream = new MediaStream();
    // document.getElementById('remote-stream').srcObject = remoteStream;
    // //adding localStream Media(audio and video tracks) using tracks to transfer audio and video over the peer-connection
    // localStream.getTracks().forEach((track)=>{
    //     peerCon.addTrack(track,localStream);
    // })
    // //response of remoteStream-Media to localStream-tracks can be done via selecting tracks from peerConn and then adding the localStream Tracks to remoteStream 
    // peerCon.ontrack = async (event) =>{
    //     event.streams[0].getTracks().forEach((track)=>{
    //         remoteStream.addTrack(track);
    //     })
    // }

    //onicecandidate triggers when iceCandidates from iceServers(STUN Servers) are added, this changes the sdp-offer/localDescription of the peer-connection  
    // peerCon.onicecandidate = async (event) =>{
    //     if(event.candidate){ //here slight-change-> sdp-answer is set in as the localDescription, since it is remoteStream which responds with answer to offer
    //         document.getElementById('sdp-answer').value = JSON.stringify(peerCon.localDescription);
    //     }
    // }

    createPeerConnection('sdp-answer');
    //same-code from createOffer till here(till onicecandidate)

    //handelling(receiving) the offer at remote-stream
    let offer = document.getElementById('sdp-offer').value;
    if(!offer){
        return alert('Retrieve offer from peer first...')
    }

    //parse the offer since it is a string
    offer = JSON.parse(offer);

    //NOTE -> answer for remoteStream is localDescription and offer for remoteStream is remoteDescription
    await peerCon.setRemoteDescription(offer);

    //creating the answer to offer
    let answer = await peerCon.createAnswer();
    await peerCon.setLocalDescription(answer);//set localDescription as answer since it is remoteStream POV here answer is created to offer received from localStream

    document.getElementById('sdp-answer').value = JSON.stringify(answer);
}

const addAnswer=async()=> { //Handling the answer received from the remoteStream at localStream
    let answer = document.getElementById('sdp-answer').value;
    if(!answer) return alert('Retrieve answer from peer first...');

    answer = JSON.parse(answer);// since it is in string format
    //now after receiving the answer we set remoteDescription of the localStream
    if(!peerCon.currentRemoteDescription){
        peerCon.setRemoteDescription(answer);
    }
}

init();