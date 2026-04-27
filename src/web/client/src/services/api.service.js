const API_BASE = "http://localhost:3001";

export async function uploadImage(file, token){

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", file.name);

    const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`},
        body: formData
    });

    if(!res.ok)
        throw new Error("Upload failed");        
    
    return res.json();
}

export async function getHistory(token){
    const res = await fetch(`${API_BASE}/user/images`, {
        headers: {Authorization : `Bearer ${token}`}       
    });

    return res.json();
}

export async function deleteImage(name, token) {
  return fetch(`${API_BASE}/user/image/${name}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });
}

