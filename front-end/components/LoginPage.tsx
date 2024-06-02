// components/LoginPage.tsx
import React, { useState } from "react";
import axios from "axios"; // Import axios for making HTTP requests

import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    Center,
    useColorModeValue,
} from "@chakra-ui/react";

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const formBackground = useColorModeValue("column-bg", "main-bg");

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        console.log("Running handle submit");
        // onLogin(true); // Temporarily logging in without validation for layout purposes
        try {
            // Make a POST request to your backend endpoint
            console.log(
                "The backend url: " + process.env.NEXT_PUBLIC_BACKEND_URL
            );
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/set-user`,
                {
                    user_id: username,
                },
                { withCredentials: true }
            );

            // Assuming the backend returns a token upon successful authentication
            // const token = response.data.token;
            if (
                response.data.message === "User added and set successfully" ||
                response.data.message === "User found and set successfully"
            ) {
                // Set the token in local storage or session storage for future requests
                //localStorage.setItem("token", token);
                // Set isLoggedIn to true indicating successful login
                console.log("It worked!!!");
                onLogin(true);
            }
        } catch (error) {
            // Handle errors, such as incorrect credentials or server errors
            alert("Incorrect username or password. Please try again.");
            console.error("Login failed:", error);
        }
    };

    return (
        <Center bg="main-bg" minH="100vh">
            <VStack
                as="form"
                onSubmit={handleSubmit}
                spacing="8"
                p="8"
                borderRadius="lg"
                bg={formBackground}
                boxShadow="base"
                w="100%"
                maxW="md"
            >
                <Heading size="lg" color="white-text">
                    Login to Athena
                </Heading>
                <FormControl id="username" isRequired>
                    <FormLabel color="white-text">Username</FormLabel>
                    <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        bg="card-bg"
                        borderColor="card-border"
                        _hover={{ borderColor: "subtle-text" }}
                        _placeholder={{ color: "subtle-text" }}
                        color="white-text"
                    />
                </FormControl>
                <FormControl id="password" isRequired>
                    <FormLabel color="white-text">Password</FormLabel>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        bg="card-bg"
                        borderColor="card-border"
                        _hover={{ borderColor: "subtle-text" }}
                        _placeholder={{ color: "subtle-text" }}
                        color="white-text"
                    />
                </FormControl>
                <Button type="submit" colorScheme="blue" size="lg" w="full">
                    Login
                </Button>
            </VStack>
        </Center>
    );
};

export default LoginPage;
