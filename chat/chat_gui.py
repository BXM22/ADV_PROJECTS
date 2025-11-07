#!/usr/bin/env python3


import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import socket
import threading


class ChatGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Chat Application")
        self.root.geometry("1000x1000")
        
        # Set purple theme
        self.setup_purple_theme()
        
        # Server variables
        self.server = None
        self.server_thread = None
        self.server_running = False
        self.clients = []
        self.nicknames = []
        self.server_socket = None
        
        # Client variables
        self.client = None
        self.client_thread = None
        self.client_connected = False
        self.nickname = ""
        
        self.create_widgets()
        
    def setup_purple_theme(self):
        """Configure purple color theme"""
        # Set root background to dark purple
        self.root.configure(bg='#4B0082')
        
        # Create and configure ttk style
        style = ttk.Style()
        style.theme_use('clam')
        
        # Configure colors
        style.configure('TFrame', background='#6A0DAD')
        style.configure('TLabelFrame', background='#6A0DAD', foreground='white', 
                       bordercolor='#9370DB', borderwidth=2)
        style.configure('TLabelFrame.Label', background='#6A0DAD', foreground='white')
        style.configure('TLabel', background='#6A0DAD', foreground='white')
        style.configure('TEntry', fieldbackground='#E6E6FA', foreground='#4B0082')
        style.configure('TButton', background='#9370DB', foreground='white', 
                       borderwidth=1, focuscolor='none')
        style.map('TButton', 
                 background=[('active', '#BA55D3'), ('pressed', '#8A2BE2')])
        
        # Configure text widget colors
        self.root.option_add('*Text.background', '#E6E6FA')
        self.root.option_add('*Text.foreground', '#4B0082')
        self.root.option_add('*Text.insertBackground', '#4B0082')
        
    def create_widgets(self):
        # Main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)  # Chat area column
        main_frame.columnconfigure(1, weight=0)  # Sidebar column (fixed width)
        main_frame.rowconfigure(2, weight=1)
        
        # Configure main frame background
        main_frame.configure(style='TFrame')
        
        # Server section
        server_frame = ttk.LabelFrame(main_frame, text="Server", padding="10")
        server_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        ttk.Label(server_frame, text="Host:").grid(row=0, column=0, padx=5)
        self.server_host = ttk.Entry(server_frame, width=15)
        self.server_host.insert(0, "localhost")
        self.server_host.grid(row=0, column=1, padx=5)
        
        ttk.Label(server_frame, text="Port:").grid(row=0, column=2, padx=5)
        self.server_port = ttk.Entry(server_frame, width=10)
        self.server_port.insert(0, "8888")
        self.server_port.grid(row=0, column=3, padx=5)
        
        self.server_start_btn = ttk.Button(server_frame, text="Start Server", command=self.start_server)
        self.server_start_btn.grid(row=0, column=4, padx=5)
        
        self.server_stop_btn = ttk.Button(server_frame, text="Stop Server", command=self.stop_server, state=tk.DISABLED)
        self.server_stop_btn.grid(row=0, column=5, padx=5)
        
        self.server_status = ttk.Label(server_frame, text="Status: Stopped", foreground="#FFB6C1")
        self.server_status.grid(row=0, column=6, padx=10)
        
        # Client section
        client_frame = ttk.LabelFrame(main_frame, text="Client", padding="10")
        client_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        ttk.Label(client_frame, text="Host:").grid(row=0, column=0, padx=5)
        self.client_host = ttk.Entry(client_frame, width=15)
        self.client_host.insert(0, "localhost")
        self.client_host.grid(row=0, column=1, padx=5)
        
        ttk.Label(client_frame, text="Port:").grid(row=0, column=2, padx=5)
        self.client_port = ttk.Entry(client_frame, width=10)
        self.client_port.insert(0, "8888")
        self.client_port.grid(row=0, column=3, padx=5)
        
        ttk.Label(client_frame, text="Nickname:").grid(row=0, column=4, padx=5)
        self.nickname_entry = ttk.Entry(client_frame, width=15)
        self.nickname_entry.grid(row=0, column=5, padx=5)
        
        self.client_connect_btn = ttk.Button(client_frame, text="Connect", command=self.connect_client)
        self.client_connect_btn.grid(row=0, column=6, padx=5)
        
        self.client_disconnect_btn = ttk.Button(client_frame, text="Disconnect", command=self.disconnect_client, state=tk.DISABLED)
        self.client_disconnect_btn.grid(row=0, column=7, padx=5)
        
        self.client_status = ttk.Label(client_frame, text="Status: Disconnected", foreground="#FFB6C1")
        self.client_status.grid(row=0, column=8, padx=10)
        
        # Chat display
        chat_frame = ttk.LabelFrame(main_frame, text="Chat", padding="10")
        chat_frame.grid(row=2, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5, padx=(0, 5))
        chat_frame.columnconfigure(0, weight=1)
        chat_frame.rowconfigure(0, weight=1)
        
        self.chat_display = scrolledtext.ScrolledText(chat_frame, height=20, width=70, 
                                                      state=tk.DISABLED, bg='#E6E6FA', 
                                                      fg='#4B0082', insertbackground='#4B0082',
                                                      font=('Arial', 10))
        self.chat_display.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Users sidebar
        users_frame = ttk.LabelFrame(main_frame, text="Online Users", padding="10")
        users_frame.grid(row=2, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        users_frame.columnconfigure(0, weight=1)
        users_frame.rowconfigure(0, weight=1)
        
        # Create Listbox for users with custom styling
        self.users_listbox = tk.Listbox(users_frame, bg='#E6E6FA', fg='#4B0082', 
                                        font=('Arial', 10), 
                                        selectbackground='#9370DB', 
                                        selectforeground='white',
                                        borderwidth=2, relief=tk.SUNKEN)
        self.users_listbox.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Scrollbar for users list
        users_scrollbar = ttk.Scrollbar(users_frame, orient=tk.VERTICAL, command=self.users_listbox.yview)
        users_scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        self.users_listbox.configure(yscrollcommand=users_scrollbar.set)
        
        # Message input
        input_frame = ttk.Frame(main_frame)
        input_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        input_frame.columnconfigure(0, weight=1)
        
        self.message_entry = ttk.Entry(input_frame)
        self.message_entry.grid(row=0, column=0, sticky=(tk.W, tk.E), padx=5)
        self.message_entry.bind("<Return>", lambda e: self.send_message())
        
        self.send_btn = ttk.Button(input_frame, text="Send", command=self.send_message, state=tk.DISABLED)
        self.send_btn.grid(row=0, column=1, padx=5)
        
    def add_message(self, message):
        """Add a message to the chat display"""
        self.chat_display.config(state=tk.NORMAL)
        self.chat_display.insert(tk.END, message + "\n")
        self.chat_display.config(state=tk.DISABLED)
        self.chat_display.see(tk.END)
    
    def update_users_list(self):
        """Update the users sidebar with current connected users"""
        self.users_listbox.delete(0, tk.END)
        for nickname in self.nicknames:
            self.users_listbox.insert(tk.END, nickname)
        
    def start_server(self):
        """Start the chat server"""
        try:
            host = self.server_host.get()
            port = int(self.server_port.get())
            
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind((host, port))
            self.server_socket.listen()
            
            self.server_running = True
            self.server_start_btn.config(state=tk.DISABLED)
            self.server_stop_btn.config(state=tk.NORMAL)
            self.server_status.config(text=f"Status: Running on {host}:{port}", foreground="#90EE90")
            
            self.add_message(f"🚀 Server started on {host}:{port}")
            
            # Start server thread
            self.server_thread = threading.Thread(target=self.server_loop, daemon=True)
            self.server_thread.start()
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to start server: {e}")
            
    def stop_server(self):
        """Stop the chat server"""
        self.server_running = False
        
        # Close all client connections
        for client in self.clients:
            try:
                client.close()
            except:
                pass
        
        self.clients = []
        self.nicknames = []
        self.root.after(0, self.update_users_list)
        
        # Close server socket
        if self.server_socket:
            try:
                self.server_socket.close()
            except:
                pass
        
        self.server_start_btn.config(state=tk.NORMAL)
        self.server_stop_btn.config(state=tk.DISABLED)
        self.server_status.config(text="Status: Stopped", foreground="#FFB6C1")
        self.add_message("🛑 Server stopped")
        
    def server_loop(self):
        """Main server loop to accept connections"""
        while self.server_running:
            try:
                client, address = self.server_socket.accept()
                self.root.after(0, self.add_message, f"✅ Connected with {str(address)}")
                
                # Request nickname from client
                client.send("NICK".encode('utf-8'))
                nickname = client.recv(1024).decode('utf-8')
                
                self.nicknames.append(nickname)
                self.clients.append(client)
                
                self.root.after(0, self.update_users_list)
                self.broadcast(f"{nickname} joined the chat!".encode('utf-8'), client)
                
                # Start thread for this client
                thread = threading.Thread(target=self.handle_client, args=(client,), daemon=True)
                thread.start()
                
            except Exception as e:
                if self.server_running:
                    self.root.after(0, self.add_message, f"❌ Server error: {e}")
                break
                
    def broadcast(self, message, sender_client):
        """Send message to all clients except the sender"""
        for client in self.clients:
            if client != sender_client:
                try:
                    client.send(message)
                except:
                    # Remove broken connections
                    try:
                        index = self.clients.index(client)
                        self.clients.remove(client)
                        client.close()
                        nickname = self.nicknames[index]
                        self.nicknames.remove(nickname)
                        self.root.after(0, self.update_users_list)
                        self.broadcast(f"{nickname} left the chat!".encode('utf-8'), client)
                    except:
                        pass
                        
    def handle_client(self, client):
        """Handle messages from a client"""
        while self.server_running:
            try:
                message = client.recv(1024)
                if message:
                    decoded_message = message.decode('utf-8')
                    self.root.after(0, self.add_message, decoded_message)
                    self.broadcast(message, client)
                else:
                    raise Exception("Client disconnected")
            except:
                # Remove client on error
                try:
                    index = self.clients.index(client)
                    self.clients.remove(client)
                    client.close()
                    nickname = self.nicknames[index]
                    self.nicknames.remove(nickname)
                    self.root.after(0, self.update_users_list)
                    self.broadcast(f"{nickname} left the chat!".encode('utf-8'), client)
                    self.root.after(0, self.add_message, f"{nickname} left the chat!")
                except:
                    pass
                break
                
    def connect_client(self):
        """Connect to the chat server"""
        try:
            host = self.client_host.get()
            port = int(self.client_port.get())
            self.nickname = self.nickname_entry.get()
            
            if not self.nickname:
                messagebox.showwarning("Warning", "Please enter a nickname")
                return
            
            self.client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.client.connect((host, port))
            
            self.client_connected = True
            self.client_connect_btn.config(state=tk.DISABLED)
            self.client_disconnect_btn.config(state=tk.NORMAL)
            self.send_btn.config(state=tk.NORMAL)
            self.client_status.config(text="Status: Connected", foreground="#90EE90")
            
            self.add_message(f"✅ Connected to server at {host}:{port}")
            
            # Send nickname
            self.client.send(self.nickname.encode('utf-8'))
            
            # Start receiving thread
            self.client_thread = threading.Thread(target=self.receive_messages, daemon=True)
            self.client_thread.start()
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to connect: {e}")
            if self.client:
                try:
                    self.client.close()
                except:
                    pass
            self.client = None
            self.client_connected = False
            
    def disconnect_client(self):
        """Disconnect from the chat server"""
        self.client_connected = False
        
        if self.client:
            try:
                self.client.close()
            except:
                pass
            self.client = None
        
        self.client_connect_btn.config(state=tk.NORMAL)
        self.client_disconnect_btn.config(state=tk.DISABLED)
        self.send_btn.config(state=tk.DISABLED)
        self.client_status.config(text="Status: Disconnected", foreground="#FFB6C1")
        self.add_message("👋 Disconnected from server")
        
    def receive_messages(self):
        """Receive messages from server"""
        while self.client_connected:
            try:
                message = self.client.recv(1024).decode('utf-8')
                if message == "NICK":
                    self.client.send(self.nickname.encode('utf-8'))
                else:
                    self.root.after(0, self.add_message, message)
            except:
                if self.client_connected:
                    self.root.after(0, self.add_message, "❌ Connection lost!")
                    self.root.after(0, self.disconnect_client)
                break
                
    def send_message(self):
        """Send a message to the server"""
        if not self.client_connected:
            return
            
        message = self.message_entry.get().strip()
        if not message:
            return
            
        try:
            full_message = f"{self.nickname}: {message}"
            self.client.send(full_message.encode('utf-8'))
            self.message_entry.delete(0, tk.END)
        except Exception as e:
            self.add_message(f"❌ Error sending message: {e}")
            self.disconnect_client()

def main():
    root = tk.Tk()
    app = ChatGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()

