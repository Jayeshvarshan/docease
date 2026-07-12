import React from "react";
import Header from "../components/Header"; // import Header component
import SpecialityMenu from "../components/SpecialityMenu";
import TopDoctors from "../components/TopDoctors";
import Banner from "../components/Banner";

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu/>
      <TopDoctors/>
      <Banner/>
     
      
    </div>
  );
};

export default Home;
