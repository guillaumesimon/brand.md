# BRAND.md Philosophy

BRAND.md records who a brand is, clearly enough that someone who has never met it can make something it would recognise as its own. The prose is where the brand lives. The structured values exist so a tool can check the few things that are checkable.

Much of this follows the [DESIGN.md philosophy](https://github.com/google-labs-code/design.md/blob/main/PHILOSOPHY.md). The first three principles are that document's, restated for brands. The rest are specific to brand work.

## A specific reference carries more than a list of adjectives

"Warm, authentic, artisanal, local" describes every bakery that has ever hired a designer. A model given those words produces the centre of what they describe.

```markdown
It looks and sounds like its own chalkboard: short, handwritten in spirit,
today's facts only. It resembles a market stall's price cards and the back
page of a parish newsletter. It does not resemble an artisan-lifestyle
brand, a patisserie window, or anything with a gold foil stamp.
```

That paragraph settles a thousand small decisions nobody will write a rule for: sentence length, whether there is a hero photograph, whether a post gets a hashtag. Adjectives describe a region. A reference describes a point.

## A trait is only usable with its limit

Every brand is "friendly". The useful information is where friendly stops.

```yaml
personality:
  - is: calm
    not: casual
    means: We lower the temperature. We never joke about outages.
```

`not` names the neighbouring trait the brand would be mistaken for. `means` says what changes in the work. A trait without both is an adjective, and the format flags it.

## Voice is taught by pairs, not described

"Clear, concise and human" cannot be followed, because every writer believes they already are. A rewrite can be followed.

```yaml
voice:
  examples:
    - instead: Never miss a critical alert again.
      write: Pages reach a person in under a minute, or go to the next one.
      why: A mechanism can be believed. A promise cannot.
```

The `why` matters most. The pair shows one case; the reason lets a writer handle the cases the file never listed.

## A rule counts only if an output can be checked against it

"Maintain a confident tone" cannot be audited, so it will not be followed. "No exclamation marks" can be checked by anyone, or by a regular expression. Wherever a preference can be turned into a number, a list or a yes-or-no, turn it.

This is also what decides which parts of a brand get structured values. A list of avoided words, a logo file path, a contrast ratio and a claim's evidence can be checked, so they have a schema. Positioning and audience cannot, so they are prose and the format does not pretend otherwise.

## Every "never" names its exception

An unconditional rule gets over-applied. Told "never put the logo on a photograph", an agent will refuse to use the photograph of the shopfront where the logo is painted on the glass.

```yaml
rules:
  - verdict: dont
    rule: Don't put the logo on a photograph.
    exception: The shopfront, where it is painted on the glass.
```

If no exception exists, write `exception: none`. That is information too. And if the exceptions cannot be listed, the rule is probably too broad.

## A rule sits next to what it governs

A guideline's don'ts used to collect at the end, in one long list that every reader had to get through. A rule about stretching the logo is no use to someone writing an email. So each rule is written in the section it concerns, and takes that section as its area. An agent can then ask for the voice rules alone, or the photography rules alone, and read nothing else.

## Colours are named for what they mean and described in words

A brand colour is called Ink or Crust, not `primary`. A role is a decision one surface makes, and the same brown may be a button on a website and nothing at all in a printed menu. Design systems assign roles; brands assign meaning.

A hex value is exact and, to an image model, invisible. So each colour also gets a sentence:

```markdown
In words: a dark baked brown, the colour of a well-fired loaf; not
chocolate, not terracotta.
```

The "not" half does the work. It names the two colours a generator would drift towards.

## Say only what is true, and say who checked

Brand files are read by tools that write public copy. A model will happily produce "trusted by thousands" or "100% organic" because those are the words that usually follow.

So the format keeps a list of what may be claimed, each with its evidence and a status. Only a person can mark a claim approved or a font licence verified. A tool that drafts either must say it is a draft. An invented approval is worse than a missing one.

## Leave out what has not been decided

A young brand may have no logo, one colour and no approved claims. That file is valid. An empty section is honest; a section filled to look complete is a set of decisions nobody made, and they will be followed as if someone had.

This is why only a name and an Overview are required, and why there are no quotas. A brand does not need five slogans.

## The format grows through its users

The spec fixes the sections and keys that most brands share. Anything else (sonic identity, packaging, a mascot, a house style for charts) can be added as a new section or a new key, and consumers preserve what they do not recognise. When enough brands add the same thing in the same way, it belongs in the spec.
