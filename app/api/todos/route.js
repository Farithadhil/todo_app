import db from '@/lib/db';

export async function GET(request) {
  try {
    const [rows] = await db.query('SELECT * FROM todos');
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error fetching todos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  const {  title, quantity, price, units  } = await request.json();

  try {
    const result = await db.query(
      'INSERT INTO todos (title, quantity, price, units) VALUES (?, ?, ?, ?)',
      [title, quantity, price, units ]
    );
    const newTodo = {
      id: result.insertId,
      title,
      quantity,
      price,
      units,
    };

    return new Response(JSON.stringify(newTodo), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error adding todo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
