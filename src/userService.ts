import { User } from './userModel';
import { v4 as uuidv4 } from 'uuid';

let users: User[] = [];

export const getAllUsers = (): User[] => {
  return users;
};

export const getUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};

export const createUser = (
  username: string,
  age: number,
  hobbies: string[],
): User => {
  const newUser: User = {
    id: uuidv4(),
    username,
    age,
    hobbies,
  };
  users.push(newUser);
  return newUser;
};

export const updateUser = (
  id: string,
  username: string,
  age: number,
  hobbies: string[],
): User | undefined => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1 || !users[userIndex]) return;

  const updatedUser = { ...users[userIndex], username, age, hobbies };
  users[userIndex] = updatedUser;
  return updatedUser;
};

export const deleteUser = (id: string): boolean => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) return false;

  users.splice(userIndex, 1);
  return true;
};
