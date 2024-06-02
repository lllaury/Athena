// Header.tsx
import { Flex, Text, Image, Box } from '@chakra-ui/react';
//import logo from './logo.png'; // Ensure the path to your logo is correct
const logo = './logo.png';
function Header() {
  return (
    <Flex
      bg="column-header-bg"
      color="white-text"
      align="center"
      justify="space-between"
      padding="4"
      boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
      width="full"
    >
    <Box display="flex" alignItems="center">
      <Image src={logo} alt="Athena Logo" css={{ filter: 'invert(100%)' }} boxSize="50px" />
      <Text fontSize="2xl" fontWeight="bold"> {/* Adjust marginLeft to bring text closer */}
        Athena
      </Text>
    </Box>
      {/* Additional header content can be added here */}
    </Flex>
  );
}

export default Header;
