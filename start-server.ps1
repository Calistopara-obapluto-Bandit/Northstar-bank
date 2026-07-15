# Simple HTTP Server for Northstar Bank
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3000/")
$listener.Start()

Write-Host "🚀 Northstar Bank server started at http://localhost:3000"
Write-Host "Press Ctrl+C to stop the server"
Write-Host ""

$mimeTypes = @{
    ".html" = "text/html"
    ".css" = "text/css"
    ".js" = "application/javascript"
    ".json" = "application/json"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png" = "image/png"
    ".gif" = "image/gif"
    ".svg" = "image/svg+xml"
    ".ico" = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf" = "font/ttf"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        Write-Host "Request: $url"
        
        # Default to index.html for root
        if ($url -eq "/") {
            $filePath = Join-Path $PWD "index.html"
        } else {
            $filePath = Join-Path $PWD ($url -replace "^/", "")
        }
        
        if (Test-Path $filePath) {
            $extension = [System.IO.Path]::GetExtension($filePath)
            $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { "application/octet-stream" }
            
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($content, 0, $content.Length)
            $response.OutputStream.Close()
            Write-Host "  → 200 OK ($contentType)"
        } else {
            $response.StatusCode = 404
            $response.OutputStream.Close()
            Write-Host "  → 404 Not Found: $filePath"
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "Server stopped"
}