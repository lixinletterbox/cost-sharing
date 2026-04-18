import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, User, MessageSquare, Send } from 'lucide-react';

export default function ContactUs() {
  const { t } = useLanguage();
  const [result, setResult] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setResult("Sending...");
    
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    
    // Web3Forms Access Key
    formData.append("access_key", "8aa520c4-628a-4a09-aadb-6b0b06afdc30");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: json
      });

      const data = await response.json();

      if (data.success) {
        setResult(t('messageSent'));
        formElement.reset();
      } else {
        console.error("Error", data);
        setResult(data.message || t('messageError'));
      }
    } catch (error) {
      console.error(error);
      setResult(t('messageError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '4rem 1rem' }}>
      <div className="glass-card" style={{ maxWidth: 700, width: '100%', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.4, borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '150px', height: '150px', background: 'var(--secondary)', filter: 'blur(80px)', opacity: 0.3, borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: '0.75rem', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('contactTitle')}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.125rem', maxWidth: '80%', margin: '0 auto' }}>
            {t('contactDesc')}
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative', zIndex: 1 }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <User size={16} color="var(--primary)" /> {t('name')}
            </label>
            <input type="text" name="name" className="input-field" required placeholder="John Doe" style={{ fontSize: '1rem', padding: '0.875rem 1.25rem' }} />
          </div>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <Mail size={16} color="var(--primary)" /> {t('email')}
            </label>
            <input type="email" name="email" className="input-field" required placeholder="john@example.com" style={{ fontSize: '1rem', padding: '0.875rem 1.25rem' }} />
          </div>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <MessageSquare size={16} color="var(--primary)" /> {t('message')}
            </label>
            <textarea 
              name="message" 
              className="input-field" 
              required 
              placeholder="How can we help you today?"
              style={{ minHeight: '160px', resize: 'vertical', fontSize: '1rem', padding: '1rem 1.25rem' }}
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
            disabled={submitting}
          >
            {submitting ? '...' : (
              <>
                {t('sendMessage')}
                <Send size={18} />
              </>
            )}
          </button>
        </form>

        {result && (
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            background: result === t('messageSent') ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: result === t('messageSent') ? '#34d399' : '#ef4444',
            textAlign: 'center',
            border: `1px solid ${result === t('messageSent') ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            fontWeight: 500,
            position: 'relative',
            zIndex: 1
          }}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
