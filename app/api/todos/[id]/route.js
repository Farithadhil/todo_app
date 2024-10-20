import db from '@/lib/db';

export async function PUT(request, { params }) {
  const { id } = params;
  const { title, quantity, price, units } = await request.json();

  try {
    const [result] = await db.query(
      'UPDATE todos SET title = ?, quantity = ?, price = ?, units = ? WHERE id = ?',
      [title, quantity, price, units, id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ message: 'Todo not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Todo updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const [result] = await db.query('DELETE FROM todos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ message: 'Todo not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Todo deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
