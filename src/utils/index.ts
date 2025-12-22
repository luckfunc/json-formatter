export async function compress(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();

  const compressed = await new Response(cs.readable).arrayBuffer();

  return btoa(String.fromCharCode(...new Uint8Array(compressed)));
}

export async function decompress(base64: string): Promise<string> {
  const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(binary);
  writer.close();

  const decompressed = await new Response(ds.readable).arrayBuffer();
  return new TextDecoder().decode(decompressed);
}
