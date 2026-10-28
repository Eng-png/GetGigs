import { useEffect, useMemo, useState } from "react";
import { Mail, Send } from "lucide-react";
import {
  loadArtistConversations,
  loadArtistMessages,
  loadBookingContacts,
  sendArtistMessage,
  type ArtistConversation,
  type ArtistMessage,
  type BookingContact,
} from "../../lib/getgigsData";
import SafeImage from "../shared/SafeImage";

type Props = {
  currentUserId: string;
  contactRole: "artist" | "booker";
  initialContact?: BookingContact | null;
};

export default function BookingMessages({
  currentUserId,
  contactRole,
  initialContact,
}: Props) {
  const [contacts, setContacts] = useState<BookingContact[]>([]);
  const [conversations, setConversations] = useState<ArtistConversation[]>([]);
  const [messages, setMessages] = useState<ArtistMessage[]>([]);
  const [selected, setSelected] = useState<BookingContact | null>(
    initialContact || null,
  );
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const visibleContacts = useMemo(() => {
    const conversationUserIds = new Set(
      conversations.map((item) =>
        item.participant_a === currentUserId
          ? item.participant_b
          : item.participant_a,
      ),
    );
    const filtered = contacts.filter(
      (contact) =>
        contact.role === contactRole && conversationUserIds.has(contact.user_id),
    );
    if (
      selected &&
      !filtered.some((contact) => contact.user_id === selected.user_id)
    )
      return [selected, ...filtered];
    return filtered;
  }, [contacts, contactRole, conversations, currentUserId, selected]);

  const conversation = useMemo(
    () =>
      selected
        ? conversations.find(
            (item) =>
              [item.participant_a, item.participant_b].includes(
                currentUserId,
              ) &&
              [item.participant_a, item.participant_b].includes(
                selected.user_id,
              ),
          )
        : undefined,
    [conversations, currentUserId, selected],
  );

  useEffect(() => {
    let active = true;
    Promise.all([loadBookingContacts(), loadArtistConversations()])
      .then(([nextContacts, nextConversations]) => {
        if (!active) return;
        setContacts(nextContacts);
        setConversations(nextConversations);
      })
      .catch((error) =>
        setNotice(
          error instanceof Error
            ? error.message
            : "Could not load booking contacts.",
        ),
      )
      .finally(() => setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }
    let active = true;
    loadArtistMessages(conversation.id)
      .then((next) => {
        if (active) setMessages(next);
      })
      .catch((error) =>
        setNotice(
          error instanceof Error
            ? error.message
            : "Could not load this conversation.",
        ),
      );
    return () => {
      active = false;
    };
  }, [conversation?.id]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !body.trim()) return;
    setSending(true);
    setNotice("");
    try {
      await sendArtistMessage(selected.user_id, body);
      setBody("");
      const nextConversations = await loadArtistConversations();
      setConversations(nextConversations);
      const nextConversation = nextConversations.find(
        (item) =>
          [item.participant_a, item.participant_b].includes(currentUserId) &&
          [item.participant_a, item.participant_b].includes(selected.user_id),
      );
      if (nextConversation)
        setMessages(await loadArtistMessages(nextConversation.id));
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Could not send your message.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="gg-booking-messages">
      <div className="gg-role-title">
        <span className="gg-kicker">Direct booking conversations</span>
        <h2>Messages</h2>
        <p>
          {contactRole === "artist"
            ? "Your artist booking conversations appear here after the first message is sent."
            : "Your conversations with venues, promoters, and organizers appear here after the first message is sent."}
        </p>
      </div>
      {notice && (
        <div className="gg-message-notice" role="status">
          {notice}
        </div>
      )}
      <div className="gg-messages-layout">
        <aside
          className="gg-contact-list"
          aria-label={`${contactRole} contacts`}
        >
          {loading ? (
            <p>Loading messages…</p>
          ) : visibleContacts.length === 0 ? (
            <div className="gg-contact-empty">
              <Mail size={24} />
              <strong>No messages yet</strong>
              <span>
                {contactRole === "artist"
                  ? "Message an artist from their profile, or wait for a new conversation."
                  : "A person or venue will appear here after a message starts the conversation."}
              </span>
            </div>
          ) : (
            visibleContacts.map((contact) => (
              <button
                type="button"
                key={contact.user_id}
                className={
                  selected?.user_id === contact.user_id ? "active" : ""
                }
                onClick={() => setSelected(contact)}
              >
                <SafeImage src={contact.image_url} alt="" />
                <span>
                  <strong>{contact.name}</strong>
                  <small>
                    {contact.subtitle ||
                      (contact.role === "artist" ? "Artist" : "Booker")}
                  </small>
                </span>
              </button>
            ))
          )}
        </aside>
        <div className="gg-message-thread">
          {!selected ? (
            <div className="gg-thread-empty">
              <Mail size={30} />
              <h3>No conversation selected</h3>
              <p>Choose an existing message on the left to continue the conversation.</p>
            </div>
          ) : (
            <>
              <header>
                <SafeImage src={selected.image_url} alt="" />
                <div>
                  <strong>{selected.name}</strong>
                  <span>{selected.subtitle}</span>
                </div>
              </header>
              <div className="gg-message-history">
                {messages.length === 0 ? (
                  <p className="gg-first-message">
                    No messages yet. Introduce yourself and include the date or
                    opportunity you want to discuss.
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={
                        message.sender_id === currentUserId ? "mine" : "theirs"
                      }
                    >
                      <p>{message.body}</p>
                      <time>
                        {new Date(message.created_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={send}>
                <textarea
                  aria-label={`Message ${selected.name}`}
                  rows={3}
                  maxLength={2000}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder={
                    contactRole === "artist"
                      ? "Hi, are you available for our event on…"
                      : "Hi, I would love to be considered for…"
                  }
                />
                <button type="submit" disabled={sending || !body.trim()}>
                  <Send size={15} />
                  {sending ? "Sending…" : "Send message"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
