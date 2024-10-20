const [theme, setTheme] = useState('light');
const ActionButton = () => {
    return (
      <div>
        <button onClick={toggleTheme} className="text-xl p-2">
{theme === 'light' ? (
  <i className="fas fa-moon text-gray-700"></i>
) : (
  <i className="fas fa-sun text-yellow-400"></i>
)}
</button>


<button onClick={downloadAsPDF} className="p-2" title="Download as PDF">
<i className="fas fa-file-pdf"></i>
</button>
<button onClick={copyAsText} className="p-2" title="Copy as Text">
<i className="fas fa-copy"></i>
</button>
<button onClick={shareOnWhatsApp} className="p-2 text-green-500" title="Share on WhatsApp">
<i className="fab fa-whatsapp"></i>
</button>
      </div>
    );
  };

  export default ActionButton;
