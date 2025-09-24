from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import pandas as pd

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def get_drive_service():
    flow = InstalledAppFlow.from_client_secrets_file(
        'credentials.json', SCOPES)
    creds = flow.run_local_server(port=0)
    return build('drive', 'v3', credentials=creds)

def list_png_files(service, folder_id):
    results = []
    page_token = None
    
    query = f"'{folder_id}' in parents and mimeType='image/png'"
    
    while True:
        response = service.files().list(
            q=query,
            pageSize=1000,
            fields="nextPageToken, files(id, name, webViewLink)",
            pageToken=page_token
        ).execute()
        
        for file in response.get('files', []):
            results.append({
                'name': file.get('name'),
                'id': file.get('id'),
                'link': f"https://drive.google.com/file/d/{file.get('id')}/view"
            })
            
        page_token = response.get('nextPageToken')
        if not page_token:
            break
    
    return results

def main():
    service = get_drive_service()
    folder_id = '1e24EDveBKLaOj878VKQvX3Gmg4A-QrrF'
    files = list_png_files(service, folder_id)
    
    # Excel 파일로 저장
    df = pd.DataFrame(files)
    df.to_excel('png_files_list.xlsx', index=False)
    
    # Obsidian용 Markdown 형식으로 저장
    with open('image_links.md', 'w', encoding='utf-8') as f:
        for _, row in df.iterrows():
            f.write(f"![[{row['name']}]]\n\n")

if __name__ == '__main__':
    main()



