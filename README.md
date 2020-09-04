# fornever.de Cloud functions

### Mit hoher Wahrscheinlichkeit _deprecated_

## Database

Das Frontend fetched zunächst eine _handgeschriebene_ JSON Datei mit einem Array aller Alben / Tracks aus der Realtime Database. Die Audiodateien liegen im Storage.

Richtigerweise würde man hier nach erfolgreichem Upload der Audiodatei eine Funktion ausführen die:

- die Datei im Storage ablegt
- eine UUID für den Track erstellt
- ein Dokument im Firestore anlegt mit:
  - Track-ID
  - URL zur Datei im Storage
  - Metadaten (Titel, Album, Jahr... ) idealerweise aus den ID3-Tags
  - Public/Private Flag basierend auf Bucket/Ordner in den die Datei geladen wurde.

außerdem
Nach dem Prinzip der NoSQL Datenbank des Firestores sollte das Dokument anschließend ablegen in:

- einer Sammlung aller Tracks
- einer Sammlung aller Alben im dazugehörigen
- später im Track Array der Playlsits

## Playlists

Das Frontend speichert das JSON Objekt des Tracks in einem Array und sendet diesen ans Backend.

```javascript
{
	title: Playlist Title,
	handle: Username,
	date: createdAt,
	tracks: [
		{
			title:Songtitle,
			year: year,
			...
		},
		...
	]
}
```

Da keine weitere Validierung stattfindet wäre es möglich eine Playlist an den Server zu senden in der jeder Track 'pwned' heisst.

Hier dürfen also nur die TrackIds ans Backend gesendet werden wo anschließend die dazugehörigen Informationen aus der Track Collection gesammelt werden und einmal in einer Playlist Collection gespeichert werden, sowohl als auch innerhalb der User Daten.

## Authentification

### Invite Codes

Ein Invite Code System gibt es in Firebase von Haus aus nicht.
Die Idee ist es das User die sich mit Invite Code registrieren einen Claim im Token erhalten, mit dem sie zusätliche Inhalte sehen können.

Die Invite Codes sind in einer Sammlung hinterlegt. Während der Registrierung wird geprüft ob sich der angegebene Code in der Sammlung befindet. Falls ja wird der Code aus der Sammlung gelöscht und der Claim dem Token hinzugefügt. Der User bekommt darüber keine Rückmeldung, sieht aber am Ende in seinem Profil ob er _Member_ oder _First Class Citizen_ ist.

### JWT

Den Token im LocalStorage zu speichern stehe ich skeptisch gegenüber. Was mir allerdings noch weniger gefallen hat ist das er nur eine Stunde gültig ist. Also eine Neuanmeldung alle 60 Minuten notwendig ist.
Als Abhilfe wird der RefreshToken in einem _httpOnly_ Cookie gespeichert. Dieser ist 7 Tage gütlig. Sollte der Token in der Anfrage abgelaufen sein, wird im Backend der RefreshToken genutzt um einen neuen Token generieren.
Nachteil hierbei ist das Serverseitig eine weitere Netzwerkanfrage für den neuen Token gültig ist. Bei einem Kaltstart des Backends kann es dann bis zu 30 Sekunden dauern bis die Seite geladen ist.
Fazit ist das man für die Authentifizierung einfach das Client SDK benutzt.
