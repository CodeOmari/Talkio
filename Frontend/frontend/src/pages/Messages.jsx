import React from 'react'
import {useState, useEffect} from 'react'
import api from '../api'
import { ACCESS_TOKEN } from '../constants'
import {jwtDecode} from 'jwt-decode'
import moment from 'moment'



export default function Message() {
    const baseURL = 'http://127.0.0.1:8000/talkio'
    const [messages, setMessages] = useState([]);
    let [newSearch, setnewSearch] = useState({search: "",});

    const axios = api
    const token = localStorage.getItem(ACCESS_TOKEN);

    let user_id = null;
    let username = null;

    if (token) {
        const decoded = jwtDecode(token)
        user_id = decoded.user_id;
        username = decoded.username;
    }

    useEffect(() => {
        try {
        // Send a get request to the api endpoint to get the message of the logged in user
        axios.get(baseURL + '/my-messages/' + user_id + '/').then((res) => {
            // Set the data that was gotten back from the database via the api to the setMessage state
            setMessages(res.data)
            // Console Log the data that was gotten from the db
            console.log(res.data);
        })
        } catch (error) {
            console.log(error);
        }
    }, [])

    const handleSearchChange = (event) => {
        setnewSearch({
        ...newSearch,
        [event.target.name]: event.target.value,
        });
    };

    const SearchUser = () => {
        axios.get(baseURL + '/search/' + newSearch.username + '/')
            .then((res) => {
                if (res.status === 404) {
                    console.log(res.data.detail);
                    alert("User does not exist");
                } else {
                    history.push('/search/'+newSearch.username+'/');
                }
            })
            .catch((error) => {
                alert("User Does Not Exist")
            });
    };
    
    return(
        <div>
            <main className='content'>
                <div className='container p-0'>
                    <h1>Messages</h1>
                    <div className="card">
                        <div className="row">
                            <div className='col-12 col-lg-5'>
                                <div className="px-4">
                                    <div className="d-flex">
                                        <div className="flex-grow">
                                            <input
                                                type="text"
                                                className="form-control my-3"
                                                placeholder="Search..."
                                                onChange={handleSearchChange}
                                                name='username'

                                            />
                                            <button className='ml-2' onClick={SearchUser} style={{border:"none", borderRadius:"50%"}}><i className='fas fa-search'></i></button>
                                        </div>
                                    </div>
                                </div>
                                {messages.map((message) =>
                                    <Link 
                                        to={"/inbox/" + (message.sender.id === user_id ? message.receiver.id : message.sender.id) + "/"}
                                        href="#"
                                        className="list-group-item list-group-item-action border-0">

                                        <small>
                                            <div className="badge bg-success float-right text-white">{moment.utc(message.date).local().startOf('seconds').fromNow()}</div>
                                        </small>
                                        <div className="d-flex align-items-start">
                                            {message.sender.id !== user_id && 
                                                <img src={message.sender_profile.image} className="rounded-circle mr-1" alt="1" width={40} height={40}/>
                                            }
                                            {message.sender.id === user_id && 
                                                <img src={message.receiver_profile.image} className="rounded-circle mr-1" alt="2" width={40} height={40}/>
                                            }
                                            <div className="flex-grow-1 ml-3">
                                                {message.sender.id === user_id && 
                                                    (message.receiver_profile.full_name !== null ? message.receiver_profile.full_name : message.receiver.username)
                                                }

                                                {message.sender.id !== user_id && 
                                                    (message.sender.username) 
                                                }
                                                <div className="small">
                                                    <small>{message.message}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )}    
                                <hr className="d-block d-lg-none mt-1 mb-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}