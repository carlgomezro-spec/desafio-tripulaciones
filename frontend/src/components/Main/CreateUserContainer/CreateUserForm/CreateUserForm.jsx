import React , {useState} from "react";
// import { useNavigate } from "react-router-dom";
import {createUser} from "../../../../services/adminServices"

const CreateUserForm = () => {
  const [userData, setUserData] = useState({email:'', role: '', password: '' });
  const [msg, setMsg] = useState('');
  
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
      const res = await createUser (userData); // Llama al servicio de login
      
      // Redirige al perfil
    } catch (error) {
        setMsg(error.msg || 'Error create a user');
      }
  }
  return <div></div>
};

export default CreateUserForm;