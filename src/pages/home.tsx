import React from 'react';
import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';
import Header from '@/layouts/Header';
import Footer from '@/layouts/Footer';


const Home = () => {

  return (
    <>
     <Main meta={<Meta title="Job Airo" description="Job Airo" />}>
      <h1>Extra page</h1>
      <Header/>
      <Footer/>
    </Main>
    </>

  );
};

export default Home;
