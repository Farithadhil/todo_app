'use client';
import { useState, useEffect } from 'react';
import SuggestionsComponent from '@/components/SuggestionsComponent';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [quantity, setQuantity] = useState('');
  const [units, setUnits] = useState('');
  const [editTodoId, setEditTodoId] = useState(null);
  const [editTodoTitle, setEditTodoTitle] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnits, setEditUnits] = useState('');
  const [theme, setTheme] = useState('light');

  // Save todos to localStorage
  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    setTodos(savedTodos);
  }, []);

  const saveTodos = (updatedTodos) => {
    setTodos(updatedTodos);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const newTodoItem = {
      id: Date.now(),
      title: newTodo,
      quantity: Number(quantity) || 0,
      units,
    };
    const updatedTodos = [...todos, newTodoItem];
    saveTodos(updatedTodos);
    setNewTodo('');
    setUnits('');
    setQuantity('');
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    saveTodos(updatedTodos);
  };

  const startEditing = (todo) => {
    setEditTodoId(todo.id);
    setEditTodoTitle(todo.title);
    setEditQuantity(todo.quantity);
    setEditUnits(todo.units);
  };

  const saveEdit = () => {
    if (!editTodoTitle.trim()) return;
    const updatedTodos = todos.map((todo) =>
      todo.id === editTodoId
        ? { ...todo, title: editTodoTitle, quantity: editQuantity, units: editUnits }
        : todo
    );
    saveTodos(updatedTodos);
    setEditTodoId(null);
    setEditTodoTitle('');
    setEditQuantity('');
    setEditUnits('');
  };

  return (
    <div className={`container mx-auto p-4 ${theme}`}>
      <SuggestionsComponent onSuggestionClick={setNewTodo} />

      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value.slice(0, 30))}
          placeholder="Item"
          className="border p-2 rounded w-1/4"
          maxLength={30}
        />
        <input
          type="text"
          value={units}
          onChange={(e) => setUnits(e.target.value.slice(0, 5))}
          placeholder="Kg/ml"
          className="border p-2 rounded w-1/6"
          maxLength={5}
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.min(Math.max(0, parseInt(e.target.value) || 0), 1000))}
          placeholder="Quantity"
          className="border p-2 rounded w-1/6"
          min="0"
          max="1000"
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add
        </button>
      </div>

      <table className="table-auto w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Kg/ml</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo) => (
            <tr key={todo.id} className="hover:bg-gray-100">
              <td className="border p-2">
                {editTodoId === todo.id ? (
                  <input
                    type="text"
                    value={editTodoTitle}
                    onChange={(e) => setEditTodoTitle(e.target.value.slice(0, 30))}
                    className="border p-1 rounded w-full"
                    maxLength={30}
                  />
                ) : (
                  todo.title
                )}
              </td>
              <td className="border p-2">
                {editTodoId === todo.id ? (
                  <input
                    type="text"
                    value={editUnits}
                    onChange={(e) => setEditUnits(e.target.value.slice(0, 5))}
                    className="border p-1 rounded w-full"
                    maxLength={5}
                  />
                ) : (
                  todo.units
                )}
              </td>
              <td className="border p-2">
                {editTodoId === todo.id ? (
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Math.min(Math.max(0, parseInt(e.target.value) || 0), 1000))}
                    className="border p-1 rounded w-full"
                    min="0"
                    max="1000"
                  />
                ) : (
                  todo.quantity
                )}
              </td>
              <td className="border p-2 flex space-x-2">
                {editTodoId === todo.id ? (
                  <>
                    <button onClick={saveEdit} className="bg-green-500 text-white p-2 rounded">Save</button>
                    <button onClick={() => setEditTodoId(null)} className="bg-gray-400 text-white p-2 rounded">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(todo)} className="bg-orange-500 text-white p-2 rounded">Edit</button>
                    <button onClick={() => deleteTodo(todo.id)} className="bg-red-500 text-white p-2 rounded">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
