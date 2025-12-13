import React from "react";
// import { useNavigate } from "react-router-dom";
import CreateUserForm from "./CreateUserForm/CreateUserForm"


const CreateUserContainer = () => {
  
  return <section className="createUser">
    <h2>Create a new User</h2>
      < CreateUserForm/>
  </section>
};

export default CreateUserContainer;