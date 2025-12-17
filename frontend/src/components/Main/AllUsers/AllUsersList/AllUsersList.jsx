import React from "react";
import User from "./User/User"
import './AllUsersList.css';



const AllUsersList = ({users,handleDelete, handleUpdateUser ,loading}) => {
   // Si está cargando, mostramos el spinner
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh"
      }}>
        <Circles
          height="80"
          width="80"
          color="#606062ff"
          ariaLabel="loading"
        />
      </div>
    );
  }
  const renderCard = () => users.map(user => <User key={user.user_id} user={user} handleDelete={handleDelete}  handleUpdateUser ={ handleUpdateUser}/>)
  return <div>
      <section className="userList">
      {renderCard()}
      </section>
  </div>
};

export default AllUsersList;