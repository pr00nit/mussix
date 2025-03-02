import "./App.css";
import { io } from "socket.io-client";
import { useMemo, useState, useEffect, useRef } from "react";
import { apiConnector } from "./services/apiconnector";

function App() {
  const socket = useMemo(() => io("http://localhost:3000"), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [trackList, setTrackList] = useState([]);
  const [songUrl, setSongUrl] = useState("");
  const audio = useRef();
  
  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });

    

    socket.on("sendSong",
      (songurl) => {
        console.log("song recieved" + songurl);
        setSongUrl(songurl);
        
      },
      
    );

    socket.on("startPlay", (data)=>{
      console.log("Playing song : " + data);
      audio.current.play();
    });

    socket.on("pauseSong", (data)=>{
      console.log("Pausing song : " + data);
      audio.current.pause();
    
    })

    return () => {
      console.log(socket);
      socket.disconnect();
    };
  },[]);

  const searchHandler = async (search) => {
    const res = await apiConnector(
      "get",
      `https://spotify81.p.rapidapi.com/search?q=${search}&type=multi&offset=0&limit=10&numberOfTopResults=5`,
      null,
      {
        "X-RapidAPI-Key": "d56b1f2effmsh5f29610e2682c33p126cd8jsn6d4e17a18aa7",
        "X-RapidAPI-Host": "spotify81.p.rapidapi.com",
      },
      null
    );

    setTrackList(res.data.tracks);
    return res;
  };

  const getSong = async (id) => {
    const res = await apiConnector(
      "GET",
      `https://spotify81.p.rapidapi.com/download_track?q=${id}&onlyLinks=1`,
      null,
      {
        "X-RapidAPI-Key": "d56b1f2effmsh5f29610e2682c33p126cd8jsn6d4e17a18aa7",
        "X-RapidAPI-Host": "spotify81.p.rapidapi.com",
      }
    );
    const songURL = res.data[0].url;
    socket.emit("playSong", songURL);
};

  const handleSongPlay = () => {
    console.log("Play song clicked")
    socket.emit("songPlay", true);
  }
  
  const handleSongPause = ()=> {
    console.log("Pause song clicked")
    //audio.current.pause();
    socket.emit("songPause", false);
  }
  

  return (
    <>
      <div>Music streams</div>
      <div>
        <h2>type song name</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => searchHandler(searchQuery)}>Search</button>
        <div className="searchdiv">
          <h6>Search results</h6>
          <ul>
            {trackList.map((item, ind) => (
              <li key={ind} onClick={() => getSong(item.data.id)}>
                <img src={item.data.albumOfTrack.coverArt.sources[0].url} />
                {item.data.albumOfTrack.name}{" "}
              </li>
            ))}
          </ul>
        </div>

        <audio ref={audio} src={songUrl} controls />
        <button onClick={()=>handleSongPlay()}>Play</button>
        <button onClick={() => handleSongPause()}>Pause</button>
      </div>
    </>
  );
}

export default App;
