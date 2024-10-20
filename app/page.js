'use client';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useState, useEffect } from 'react';
import { notoSanstamilBase64 } from '@/app/fonts/NotoSansTamil.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SuggestionsComponent from '@/components/SuggestionsComponent';
import TodoApp from '@/components/TodoApp';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [units, setUnits] = useState('');
  const [editTodoId, setEditTodoId] = useState(null);
  const [editTodoTitle, setEditTodoTitle] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editUnits, setEditUnits] = useState('');
  const [theme, setTheme] = useState('light');
  const { data: session, status } = useSession();



  const handleSuggestionClick = (suggestion) => {
    setNewTodo(suggestion);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.add(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // useEffect(() => {
  //   fetchTodos();
  // }, []);

  useEffect(() => {
    if (session) {
      fetchTodos(); // Fetch todos from the database for logged-in users
    } else {
      const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
      setTodos(savedTodos); // Use localStorage for non-registered users
    }
  }, [session]);

  const fetchTodos = async () => {
    if (!session) return; // Skip fetching if the user is not logged in
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      // Ensure data is an array before setting the todos state
      setTodos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setTodos([]); // Default to an empty array in case of an error
    }
  };

  const logout = () => {
    signOut(); // Log out user
    setTodos([]); // Clear todos from state
    // localStorage.removeItem('todos'); // Optional: Clear todos from local storage if desired
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTodo,
          quantity: Number(quantity) || 0,
          price: parseFloat(price) || 0,
          units,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add todo');
      }

      const newTodoItem = await res.json();
      setTodos([...todos, newTodoItem]);
      setNewTodo('');
      setUnits('');
      setQuantity('');
      setPrice('');
      setUnits('');
      // setCategory('Other');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const startEditing = (todo) => {
    setEditTodoId(todo.id);
    setEditTodoTitle(todo.title);
    setEditQuantity(todo.quantity);
    setEditPrice(todo.price);
    setEditUnits(todo.units);
  };

  const saveEdit = async () => {
    if (!editTodoTitle.trim()) return;

    try {
      await fetch(`/api/todos/${editTodoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTodoTitle,
          quantity: editQuantity,
          price: editPrice,
          units: editUnits,
        }),
      });
      fetchTodos(); // Refresh the todo list
      setEditTodoId(null); // Reset edit state
      setEditTodoTitle(''); // Clear input
      setEditQuantity('');
      setEditPrice('');
      setEditUnits('');
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  // Function to generate PDF and either download or return URL
  const generatePDF = (returnBlobUrl = false) => {
    const doc = new jsPDF();

    // Add the Noto Sans font to the PDF
    doc.addFileToVFS('NotoSansTamil-Regular.ttf', notoSanstamilBase64);
    doc.addFont('NotoSansTamil-Regular.ttf', 'NotoSansTamil', 'normal');
    doc.setFont('NotoSansTamil');

    // Title and date formatting
    const title = 'My Grocery List';
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    doc.setFontSize(18);
    doc.text(title, 10, 10); // Title on the left
    doc.setFontSize(12);
    doc.text(currentDate, 170, 10); // Date on the right

    // Check if the user is logged in, otherwise use localStorage data for non-registered users
    const todosForPdf = session ? todos : JSON.parse(localStorage.getItem('todos')) || [];

    // List the todos in a table format
    const tableColumn = ['Name', 'Units', 'Quantity', 'Price'];
    const tableRows = todosForPdf.map((todo) => [
      todo.title,
      todo.units,
      todo.quantity,
      `${(Number(todo.price) || 0).toFixed(2)}`,
    ]);

    // Adding table to PDF
    try {
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [tableColumn],
          tableWidth: 'auto',
          body: tableRows,
          startY: 20,
          theme: 'striped',
          styles: {
            font: 'NotoSansTamil', // Apply the custom Tamil font to the body
            fontStyle: 'normal', // Set the font style (bold, normal, italic, etc.)
            fontSize: 10, // Customize font size for table body
          },
        });
      } else {
        console.error('autoTable is not a function. Make sure it is properly imported.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }

    if (returnBlobUrl) {
      // If returnBlobUrl is true, return Blob URL of the PDF
      const pdfBlob = doc.output('blob');
      return URL.createObjectURL(pdfBlob);
    } else {
      // Directly save the PDF file
      doc.save('todo_list.pdf');
    }
  };

  // Function to download PDF directly
  const downloadAsPDF = () => {
    generatePDF(false); // Directly call generatePDF with returnBlobUrl set to false
  };

  // Function to handle sharing on WhatsApp
  const shareOnWhatsApp = () => {
    // Generate PDF Blob URL
    const pdfUrl = generatePDF(true);

    // Trigger a download for the PDF file to ensure the user has it
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = 'todo_list.pdf';
    downloadLink.click();

    // Get todos for WhatsApp message (handle both logged-in and non-registered users)
    const todosForWhatsApp = session ? todos : JSON.parse(localStorage.getItem('todos')) || [];

    // Open WhatsApp with a pre-filled message and link to PDF
    const message = `I have created a grocery list. Please find the attached PDF file.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    //      const message = `I have created a grocery list. Please find the attached PDF file. Items:\n` + 
    //   todosForWhatsApp.map(todo => `${todo.title}: ${todo.quantity} @ $${todo.price}`).join('\n');
    // const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    // window.open(whatsappUrl, '_blank');
  };


  // Function to copy the list as text to clipboard
  const copyAsText = () => {
    // Get todos for copying text (handle both logged-in and non-registered users)
    const todosToCopy = session ? todos : JSON.parse(localStorage.getItem('todos')) || [];

    const textContent = todosToCopy.map(todo => `${todo.title}: ${todo.quantity} @ $${todo.price}`).join('\n');

    navigator.clipboard.writeText(textContent)
      .then(() => alert('Todo list copied to clipboard!'))
      .catch((err) => console.error('Error copying text:', err));
  };


  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (

      <div className={`container mx-auto p-4 ${theme}`}>
        <div className="flex justify-between items-center mb-6">
          <img src="/maligai_list.svg" alt="maligai Saman List App" className="logo" width={200} height={100} />

          <div className="flex items-center space-x-4">


            <button onClick={downloadAsPDF} className="p-2" title="Download as PDF">
              <i className="fas fa-file-pdf fa-2x"></i>
            </button>
            <button onClick={copyAsText} className="p-2" title="Copy as Text">
              <i className="fas fa-copy fa-2x"></i>
            </button>
            <button onClick={shareOnWhatsApp} className="p-2 text-white-500" title="Share on WhatsApp">
              <i className="fab fa-whatsapp fa-2x"></i>
            </button>


            <button onClick={toggleTheme} className="text-xl p-2">
              {theme === 'light' ? (
                <i className="fas fa-moon text-gray-700 fa-1x"></i>
              ) : (
                <i className="fas fa-sun text-yellow-400 fa-1x"></i>
              )}
            </button>



            <Link href="/login">
              <span className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Login</span>
            </Link>
          </div>
        </div>
        <TodoApp></TodoApp>
        <p>Please log in to access your todo list App.</p>
      </div>

    );
  }

  return (
    <div className={`container mx-auto p-4 ${theme}`}>
      <div className="flex justify-between items-center mb-6">
        <img src="/maligai_list.svg" alt="maligai Saman List App" className="logo" width={200} height={100} />

        <div className="flex space-x-4 items-center">



          <button onClick={downloadAsPDF} className="p-2" title="Download as PDF">
            <i className="fas fa-file-pdf fa-2x"></i>
          </button>
          <button onClick={copyAsText} className="p-2" title="Copy as Text">
            <i className="fas fa-copy fa-2x"></i>
          </button>
          <button onClick={shareOnWhatsApp} className="p-2 text-white-500" title="Share on WhatsApp">
            <i className="fab fa-whatsapp fa-2x"></i>
          </button>


          <button onClick={toggleTheme} className="text-xl p-2">
            {theme === 'light' ? (
              <i className="fas fa-moon text-gray-700 fa-1x"></i>
            ) : (
              <i className="fas fa-sun text-yellow-400 fa-1x"></i>
            )}
          </button>


          {!session ? (
            <Link href="/login">
              <span className="bg-blue-500 text-white px-4 py-2 rounded">Login</span>
            </Link>
          ) : (
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
          )}
        </div>



      </div>
      <SuggestionsComponent onSuggestionClick={handleSuggestionClick} />


      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value.slice(0, 30))}
          placeholder="Item"
          className="border border-gray-300 dark:border-gray-600 p-2 rounded w-1/4 dark:bg-gray-800 dark:text-white"
          maxLength={30}
        />
        <input
          type="text"
          value={units}
          onChange={(e) => setUnits(e.target.value.slice(0, 5))}
          placeholder="Kg/ml"
          className="border border-gray-300 dark:border-gray-600 p-2 rounded w-1/6 dark:bg-gray-800 dark:text-white"
          maxLength={5}
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.min(Math.max(0, parseInt(e.target.value) || 0), 1000))}
          placeholder="Quantity"
          className="border border-gray-300 dark:border-gray-600 p-2 rounded w-1/6 dark:bg-gray-800 dark:text-white"
          min="0"
          max="1000"
        />
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(Math.min(Math.max(0, parseFloat(e.target.value) || 0), 50000))}
          placeholder="₹ Price "
          className="border border-gray-300 dark:border-gray-600 p-2 rounded w-1/6 dark:bg-gray-800 dark:text-white"
          min="0"
          max="50000"
        />

        <button
          onClick={addTodo}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      <table className="table-auto w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border border-gray-300 dark:border-gray-600 p-2">Name</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Kg/ml</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Quantity</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">₹ Price</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(todos) && todos.length > 0 ? (
            todos.map((todo) => (
              <tr key={todo.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="border border-gray-300 dark:border-gray-600 p-2">
                  {editTodoId === todo.id ? (
                    <input
                      type="text"
                      value={editTodoTitle}
                      onChange={(e) => setEditTodoTitle(e.target.value.slice(0, 30))}
                      className="border border-gray-300 dark:border-gray-600 p-1 rounded w-full dark:bg-gray-800 dark:text-white"
                      maxLength={30}
                    />
                  ) : (
                    todo.title
                  )}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2">
                  {editTodoId === todo.id ? (
                    <input
                      type="text"
                      value={editUnits}
                      onChange={(e) => setEditUnits(e.target.value.slice(0, 5))}
                      className="border border-gray-300 dark:border-gray-600 p-1 rounded w-full dark:bg-gray-800 dark:text-white"
                      maxLength={5}
                    />
                  ) : (
                    todo.units
                  )}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2">
                  {editTodoId === todo.id ? (
                    <input
                      type="number"
                      value={editQuantity}
                      onChange={(e) =>
                        setEditQuantity(Math.min(Math.max(0, parseInt(e.target.value) || 0), 1000))
                      }
                      className="border border-gray-300 dark:border-gray-600 p-1 rounded w-full dark:bg-gray-800 dark:text-white"
                      min="0"
                      max="1000"
                    />
                  ) : (
                    todo.quantity
                  )}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2">
                  {editTodoId === todo.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) =>
                        setEditPrice(Math.min(Math.max(0, parseFloat(e.target.value) || 0), 50000))
                      }
                      className="border border-gray-300 dark:border-gray-600 p-1 rounded w-full dark:bg-gray-800 dark:text-white"
                      min="0"
                      max="50000"
                    />
                  ) : (
                    todo.price
                  )}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 p-2 flex space-x-2">
                  {editTodoId === todo.id ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600"
                        aria-label="Save"
                      >
                        <i className="fas fa-save"></i>
                      </button>
                      <button
                        onClick={() => setEditTodoId(null)}
                        className="bg-gray-400 text-white py-1 px-2 rounded hover:bg-gray-500"
                        aria-label="Cancel"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(todo)}
                        className="bg-orange-500 text-white py-1 px-2 rounded hover:bg-orange-600"
                        aria-label="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                        aria-label="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-2">
                No todos found.
              </td>
            </tr>
          )}
        </tbody>
      </table>


      <div className="flex justify-between items-center mt-6">
        Left Side - Buttons
        <div className="space-x-4">

        </div>

        {/* Right Side - Total Price */}
        <div className="text-2xl font-bold">
          Total Price: ${todos.reduce((acc, todo) => acc + parseFloat(todo.price || 0), 0).toFixed(2)}
        </div>
      </div>




    </div>
  );
}
