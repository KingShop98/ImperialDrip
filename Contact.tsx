import React, { useState } from 'react';
import { Crown, CheckCircle } from 'lucide-react';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        alert('Error al enviar el mensaje');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="bg-[#1a1a1a] rounded-3xl p-12 border border-white/5 flex flex-col items-center">
          <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-8">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-white mb-4">¡Mensaje enviado correctamente!</h1>
          <p className="text-gray-400 mb-8 text-lg">
            Hemos recibido tu mensaje. Te responderemos lo antes posible a tu correo electrónico.
          </p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
          >
            Volver a contacto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-12">
        <Crown size={48} className="text-yellow-500 mx-auto mb-6" />
        <h1 className="text-4xl font-serif font-bold text-yellow-500 mb-4">Contacta con Imperial Drip</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          ¿Tienes alguna pregunta o problema? Escríbenos y te responderemos lo antes posible.
        </p>
      </div>
      
      <div className="bg-[#1a1a1a] rounded-3xl p-8 md:p-12 border border-white/5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre completo *</label>
            <input 
              required 
              type="text" 
              name="name" 
              placeholder="Tu nombre"
              value={formData.name} 
              onChange={handleInputChange} 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email *</label>
            <input 
              required 
              type="email" 
              name="email" 
              placeholder="tu@email.com"
              value={formData.email} 
              onChange={handleInputChange} 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Teléfono</label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="+34 600 000 000"
              value={formData.phone} 
              onChange={handleInputChange} 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Mensaje *</label>
            <textarea 
              required 
              name="message" 
              rows={5}
              placeholder="Escribe tu mensaje aquí..."
              value={formData.message} 
              onChange={handleInputChange} 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 resize-none" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 ${isSubmitting ? 'bg-yellow-500/50 text-black/50 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <span>Enviar mensaje</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
