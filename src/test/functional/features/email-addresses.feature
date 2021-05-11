Feature: Email-addresses

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "hmcts.super.fact@gmail.com" "Pa55word11"
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    When I click edit next to a chosen court or tribunal
    Then I am redirected to the Edit Court page for the chosen court
    When I click the Emails tab
    Then I can view the existing emails

  Scenario Outline: Add new Email
    And I add Description from the dropdown "<adminId>" and Address "<address>" and Explanation "<explanation>" and Welsh Explanation "<explanationCy>"
    When I click on Add new Email
    And I click save button
    Then a green update message showing email updated is displayed

    Examples:
      | adminId | address       | explanation  | explanationCy |
      | 6       | abs@gmail.com | County Court | Llys sirol    |

  Scenario: Leave email type and address blank
    When I click on Add new Email
    When I leave adminId blank
    And I leave Address blank
    When I click on Add new Email
    And I click save button
    Then A red error message display

  Scenario: Remove emails
    When I click the remove button below a email section
    And I click save button
    Then a green update message showing email updated is displayed

  Scenario Outline: Email validation
    When I add Description from the dropdown "<adminId>" and wrong Email-Address "<address>"
    When I click on Add new Email
    And I click save button
    Then An error message is displayed with the text "<validation>"

    Examples:
      |adminId  |address           |validation                                                             |
      |6        |abcabc@gmailcom.  |Enter an email address in the correct format, like name@example.com      |
      |6        |abcefg!gmail.com  |Enter an email address in the correct format, like name@example.com    |
      |6        |abcef              |Enter an email address in the correct format, like name@example.com    |

